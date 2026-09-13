import os
import io
import base64
import torch
import runpod
from PIL import Image
from transformers import AutoModelForImageSegmentation
import torchvision.transforms.functional as F

# 1. Initialize model globally
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading briaai/RMBG-2.0 on {device}...")
try:
    model_id = "briaai/RMBG-2.0"
    net = AutoModelForImageSegmentation.from_pretrained(model_id, trust_remote_code=True)
    net.to(device)
    net.eval()
    print("Model loaded successfully.")
except Exception as e:
    print(f"Failed to load model: {e}")
    net = None

def process_image(img: Image.Image) -> Image.Image:
    # Resize to 1024x1024 for model input
    model_input_size = (1024, 1024)
    orig_size = img.size
    
    # Prepare input tensor
    image_tensor = F.to_tensor(img.resize(model_input_size, Image.Resampling.BILINEAR))
    image_tensor = F.normalize(image_tensor, [0.5, 0.5, 0.5], [1.0, 1.0, 1.0]).unsqueeze(0).to(device)

    # Inference without gradients
    with torch.no_grad():
        preds = net(image_tensor)[0]
    
    # Process output mask
    pred = preds[0].squeeze()
    pred = (pred - pred.min()) / (pred.max() - pred.min())
    mask = Image.fromarray((pred.cpu().numpy() * 255).astype("uint8"), mode="L")
    mask = mask.resize(orig_size, Image.Resampling.LANCZOS)
    
    # Apply mask to original image
    out_img = img.copy()
    out_img.putalpha(mask)
    return out_img

def handler(event):
    if net is None:
        return {"error": "Model failed to initialize on worker startup."}

    try:
        input_data = event.get("input", {})
        if not input_data:
            return {"error": "Missing 'input' payload."}
        
        image_str = input_data.get("image")
        if not image_str:
            return {"error": "Missing 'image' field in input."}
            
        # Handle optional data URI prefix
        if image_str.startswith("data:image"):
            try:
                image_str = image_str.split(",", 1)[1]
            except IndexError:
                return {"error": "Malformed data URI."}
            
        try:
            image_bytes = base64.b64decode(image_str)
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            return {"error": "Invalid base64 encoding or corrupted image."}
            
        # Run inference
        result_img = process_image(img)
        
        # Encode output transparent PNG
        out_buf = io.BytesIO()
        result_img.save(out_buf, format="PNG")
        out_b64 = base64.b64encode(out_buf.getvalue()).decode("utf-8")
        
        return {
            "image": f"data:image/png;base64,{out_b64}"
        }
    except Exception as e:
        return {"error": "Internal processing error during inference."}

if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
