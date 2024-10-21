FROM continuumio/miniconda3

WORKDIR /app

# Copy the environment file
COPY environment.yml .

# Create the conda environment
RUN conda env create -f environment.yml

# Activate the conda environment
SHELL ["conda", "run", "-n", "video-llava", "/bin/bash", "-c"]

# Copy the Python script
COPY video_llava.py .

# Set the entrypoint
ENTRYPOINT ["conda", "run", "-n", "video-llava", "python", "video_llava.py"]
