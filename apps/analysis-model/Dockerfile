FROM continuumio/miniconda3

WORKDIR /app

# Copy files
COPY environment.yml .
COPY config.py .
COPY video_llava.py .
COPY aws_utils.py .
COPY main.py .

# Create the conda environment
RUN conda env create -f environment.yml

# Activate the conda environment
SHELL ["conda", "run", "-n", "video-llava", "/bin/bash", "-c"]

# Download the model files
RUN python -c "from transformers import VideoLlavaForConditionalGeneration; VideoLlavaForConditionalGeneration.from_pretrained('LanguageBind/Video-LLaVA-7B-hf', device_map='auto', attn_implementation=None)"

# Set the entrypoint
ENTRYPOINT ["conda", "run", "-n", "video-llava", "python", "main.py"]
