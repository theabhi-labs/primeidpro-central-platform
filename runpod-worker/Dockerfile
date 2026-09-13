# Use official PyTorch image with CUDA support
FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    HF_HUB_ENABLE_HF_TRANSFER=1

# Install system dependencies (build-essential for some pip packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the briaai/RMBG-2.0 model into the Docker image
COPY builder.py .
RUN python builder.py

# Copy the serverless handler
COPY handler.py .

# Expose port (not strictly required for runpod serverless, but good practice)
EXPOSE 8000

# Start the RunPod serverless handler
CMD ["python", "-u", "handler.py"]
