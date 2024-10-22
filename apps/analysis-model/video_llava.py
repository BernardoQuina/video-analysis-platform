import av
import numpy as np
import requests
import tempfile
import os
from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration


def download_video(url):
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
        for chunk in response.iter_content(chunk_size=8192):
            temp_file.write(chunk)
    return temp_file.name


def read_video_pyav(container, num_frames=8):
    frames = []
    container.seek(0)

    # Get video stream
    stream = container.streams.video[0]
    total_frames = stream.frames
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)

    for i, frame in enumerate(container.decode(video=0)):
        if i in indices:
            frames.append(frame.to_ndarray(format="rgb24"))
            if len(frames) == num_frames:
                break

    return np.stack(frames)


def process_video(video_url, prompt):
    model_name = "LanguageBind/Video-LLaVA-7B-hf"

    # Initialize processor with correct settings
    processor = VideoLlavaProcessor.from_pretrained(model_name)
    processor.patch_size = 14  # Standard patch size for ViT
    processor.vision_feature_select_strategy = "uniform"

    # Initialize model with tied weights
    model = VideoLlavaForConditionalGeneration.from_pretrained(
        model_name, device_map="auto", torch_dtype="auto"
    )
    model.tie_weights()

    # Download and process video
    temp_video_path = download_video(video_url)
    try:
        container = av.open(temp_video_path)

        # Extract 8 frames uniformly
        clip = read_video_pyav(container, num_frames=8)

        # Process inputs
        inputs = processor(
            text=prompt,
            videos=clip,
            return_tensors="pt",
            max_patches=400,  # Set maximum number of patches
        ).to(model.device)

        # Generate response
        generate_ids = model.generate(
            **inputs, do_sample=True, max_new_tokens=80, temperature=0.7, top_p=0.9
        )

        return processor.batch_decode(
            generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )[0]

    finally:
        container.close()
        os.unlink(temp_video_path)


if __name__ == "__main__":
    video_url = "https://replicate.delivery/pbxt/JvUeO366GYGoMEHxfSwn39LYgScZh6hKNj2EuJ17SXO6aGER/archery.mp4"
    prompt = "USER: <video>\nWhat are these two doing? ASSISTANT:"
    result = process_video(video_url, prompt)
    print(result)
