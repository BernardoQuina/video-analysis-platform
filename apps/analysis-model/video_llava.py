import av
import numpy as np
import requests
import tempfile
import os
from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration


def download_video(url):
    response = requests.get(url, stream=True)
    response.raise_for_status()

    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        for chunk in response.iter_content(chunk_size=8192):
            temp_file.write(chunk)

    return temp_file.name


def read_video_pyav(container, indices):
    frames = []
    container.seek(0)
    start_index = indices[0]
    end_index = indices[-1]
    for i, frame in enumerate(container.decode(video=0)):
        if i > end_index:
            break
        if i >= start_index and i in indices:
            frames.append(frame)
    return np.stack([x.to_ndarray(format="rgb24") for x in frames])


def process_video(video_url, prompt):
    model_name = "LanguageBind/Video-LLaVA-7B-hf"
    processor = VideoLlavaProcessor.from_pretrained(model_name)

    # Ensure processor configuration is set properly
    processor.patch_size = 32
    processor.vision_feature_select_strategy = "default"

    model = VideoLlavaForConditionalGeneration.from_pretrained(
        model_name, device_map="auto", attn_implementation=None
    )

    # Download video
    temp_video_path = download_video(video_url)

    try:
        container = av.open(temp_video_path)
        total_frames = container.streams.video[0].frames
        indices = np.arange(0, total_frames, total_frames / 8).astype(int)
        clip = read_video_pyav(container, indices)

        # Ensure input is batched properly (even for one video)
        inputs = processor(text=prompt, videos=[clip], return_tensors="pt")

        # Generate response with batch input
        generate_ids = model.generate(**inputs, do_sample=True, max_new_tokens=80)
        return processor.batch_decode(
            generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )[0]
    finally:
        # Clean up temporary file
        os.unlink(temp_video_path)


if __name__ == "__main__":
    video_url = "https://replicate.delivery/pbxt/JvUeO366GYGoMEHxfSwn39LYgScZh6hKNj2EuJ17SXO6aGER/archery.mp4"
    prompt = "USER: <video>\nWhat are these two doing? ASSISTANT:"
    result = process_video(video_url, prompt)
    print(result)
