FROM nvidia/cuda:12.6.2-cudnn-runtime-ubuntu24.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
  python3-pip \
  python3-venv \
  python3-dev \
  ffmpeg \
  libsm6 \
  libxext6 \
  libxrender-dev \
  && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Create and activate virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy remaining files
COPY config.py .
COPY aws_utils.py .
COPY download_model.py .
COPY video_llava.py .
COPY main.py .

# Set environment variables for GPU support
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility,video

# Download model
RUN python3 download_model.py

# Command to run the script
CMD ["python3", "-u", "main.py"]
