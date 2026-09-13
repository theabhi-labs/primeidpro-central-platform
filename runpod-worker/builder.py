import os
from transformers import AutoModelForImageSegmentation

def build():
    print("Pre-downloading briaai/RMBG-2.0 to Docker cache...")
    model_id = "briaai/RMBG-2.0"
    # Download explicitly so it's cached in ~/.cache/huggingface
    AutoModelForImageSegmentation.from_pretrained(model_id, trust_remote_code=True)
    print("Download complete.")

if __name__ == "__main__":
    build()
