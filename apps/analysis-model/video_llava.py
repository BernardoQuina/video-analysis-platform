import os
import av
import numpy as np
import torch
from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration, BitsAndBytesConfig
import config


def initialize_model_and_processor():
    print("CUDA available:", torch.cuda.is_available())
    print("Device count:", torch.cuda.device_count())
    print(
        "Device name:",
        torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU",
    )

    # Initialize processor with correct settings
    processor = VideoLlavaProcessor.from_pretrained(config.MODEL_NAME)

    # Set the required attributes with their correct values
    # processor.patch_size = 14
    # processor.vision_feature_select_strategy = "default"

    # Configure quantization
    quantization_config = BitsAndBytesConfig(
        load_in_8bit=True, bnb_4bit_compute_dtype=torch.float16
    )

    # Load model with proper configuration
    model = VideoLlavaForConditionalGeneration.from_pretrained(
        config.MODEL_NAME,
        device_map="auto",
        attn_implementation="sdpa",
        quantization_config=quantization_config,
        torch_dtype=torch.float16,
    )

    print("Device map:", model.hf_device_map)

    return processor, model


def read_video_pyav(container, num_frames=8):
    # Extract video stream
    video_stream = container.streams.video[0]
    total_frames = video_stream.frames

    # Calculate indices to sample frames evenly
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = []

    for i, frame in enumerate(container.decode(video=0)):
        if i in indices:
            frames.append(frame.to_ndarray(format="rgb24"))
            if len(frames) == num_frames:
                break

    return np.stack(frames)


def process_video(video_path, prompt, processor, model):
    container = av.open(video_path)
    try:
        clip = read_video_pyav(container, num_frames=8)

        # Process inputs
        inputs = processor(text=prompt, videos=clip, return_tensors="pt", padding=True)

        # Move inputs to the same device as the model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items() if torch.is_tensor(v)}

        # Generate response
        with torch.inference_mode():
            generate_ids = model.generate(
                **inputs,
                do_sample=True,
                max_new_tokens=config.MAX_NEW_TOKENS,
                pad_token_id=processor.tokenizer.pad_token_id,
                eos_token_id=processor.tokenizer.eos_token_id,
            )

        # Decode and return result
        result = processor.batch_decode(
            generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )[0]

        return result
    finally:
        # Clean up
        container.close()
        os.unlink(video_path)


# import av
# import numpy as np
# import requests
# import tempfile
# import os
# import torch
# from transformers import (
#     VideoLlavaProcessor,
#     VideoLlavaForConditionalGeneration,
#     BitsAndBytesConfig,
# )


# def download_video(url):
#     response = requests.get(url, stream=True)
#     response.raise_for_status()
#     with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
#         for chunk in response.iter_content(chunk_size=8192):
#             temp_file.write(chunk)
#     return temp_file.name


# def read_video_pyav(container, num_frames=8):
#     # Extract video stream
#     video_stream = container.streams.video[0]
#     total_frames = video_stream.frames

#     # Calculate indices to sample frames evenly
#     indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
#     frames = []

#     for i, frame in enumerate(container.decode(video=0)):
#         if i in indices:
#             frames.append(frame.to_ndarray(format="rgb24"))
#             if len(frames) == num_frames:
#                 break

#     return np.stack(frames)


# def process_video(video_url, prompt):
#     print("CUDA available:", torch.cuda.is_available())
#     print("Device count:", torch.cuda.device_count())
#     print(
#         "Device name:",
#         torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU",
#     )

#     model_name = "LanguageBind/Video-LLaVA-7B-hf"

#     # Initialize processor with correct settings
#     processor = VideoLlavaProcessor.from_pretrained(model_name)

#     # Set the required attributes with their correct values
#     # processor.patch_size = 14
#     # processor.vision_feature_select_strategy = "default"

#     # Configure quantization
#     quantization_config = BitsAndBytesConfig(
#         load_in_8bit=True, bnb_4bit_compute_dtype=torch.float16
#     )

#     # Load model with proper configuration
#     model = VideoLlavaForConditionalGeneration.from_pretrained(
#         model_name,
#         device_map="auto",
#         attn_implementation="sdpa",  # Changed from None to "sdpa"
#         quantization_config=quantization_config,
#         torch_dtype=torch.float16,
#     )

#     print("Device map:", model.hf_device_map)

#     # Download and process video
#     temp_video_path = download_video(video_url)

#     try:
#         container = av.open(temp_video_path)

#         # Read exactly 8 frames from the video
#         clip = read_video_pyav(container, num_frames=8)

#         # Process inputs
#         inputs = processor(text=prompt, videos=clip, return_tensors="pt", padding=True)

#         # Move inputs to the same device as the model
#         device = next(model.parameters()).device
#         inputs = {k: v.to(device) for k, v in inputs.items() if torch.is_tensor(v)}

#         # Generate response
#         with torch.inference_mode():
#             generate_ids = model.generate(
#                 **inputs,
#                 do_sample=True,
#                 max_new_tokens=100,
#                 pad_token_id=processor.tokenizer.pad_token_id,
#                 eos_token_id=processor.tokenizer.eos_token_id,
#             )

#         # Decode and return result
#         result = processor.batch_decode(
#             generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False
#         )[0]

#         return result

#     finally:
#         # Clean up
#         container.close()
#         os.unlink(temp_video_path)


# if __name__ == "__main__":
#     video_url = "https://replicate.delivery/pbxt/JvUeO366GYGoMEHxfSwn39LYgScZh6hKNj2EuJ17SXO6aGER/archery.mp4"
#     prompt = "USER: <video>\nWhat is happening in this video? ASSISTANT:"
#     result = process_video(video_url, prompt)
#     print(result)
