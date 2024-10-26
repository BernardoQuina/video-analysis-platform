import torch
from transformers import (
    VideoLlavaProcessor,
    VideoLlavaForConditionalGeneration,
    BitsAndBytesConfig,
)
import config

# Download and cache the processor
processor = VideoLlavaProcessor.from_pretrained(config.MODEL_NAME)

# Configure quantization
quantization_config = BitsAndBytesConfig(
    load_in_8bit=True, bnb_4bit_compute_dtype=torch.float16
)

# Download and cache the model
model = VideoLlavaForConditionalGeneration.from_pretrained(
    config.MODEL_NAME,
    device_map="auto",
    attn_implementation="sdpa",
    quantization_config=quantization_config,
    torch_dtype=torch.float16,
)
