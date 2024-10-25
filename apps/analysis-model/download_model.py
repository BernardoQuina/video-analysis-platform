from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration
import config

# Download and cache the processor
processor = VideoLlavaProcessor.from_pretrained(config.MODEL_NAME)

# Download and cache the model
model = VideoLlavaForConditionalGeneration.from_pretrained(
    config.MODEL_NAME,
    device_map="auto",
    attn_implementation="sdpa",
    #    quantization_config=quantization_config,
    #    torch_dtype=torch.float16
)
