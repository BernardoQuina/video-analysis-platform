import json
import os
import time
from video_llava import initialize_model_and_processor, process_video
from aws_utils import get_aws_clients, receive_message, delete_message, download_from_s3
import config


def format_prompt(prompt):
    """
    Format the user's prompt with the required prefix and suffix.
    """
    return f"{config.PROMPT_PREFIX}{prompt}{config.PROMPT_SUFFIX}"


def process_message_body(message_body):
    try:
        data = json.loads(message_body)
        video_s3_uri = data.get("video_s3_uri")
        prompt = data.get("prompt")

        if not video_s3_uri or not prompt:
            raise ValueError("Missing required fields in message")

        # Format the prompt with required prefix and suffix
        formatted_prompt = format_prompt(prompt)

        return video_s3_uri, formatted_prompt
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in message")


def process_message(message, sqs, s3, processor, model):
    try:
        video_s3_uri, formatted_prompt = process_message_body(message["Body"])
        temp_video_path = download_from_s3(s3, video_s3_uri)

        try:
            result = process_video(temp_video_path, formatted_prompt, processor, model)
            print(f"Processed video result: {result}")

        finally:
            # Clean up temporary file
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)

        # Delete message after successful processing
        delete_message(sqs, message["ReceiptHandle"])

    except Exception as e:
        print(f"Error processing message: {str(e)}")


def main():
    if not config.SQS_QUEUE_URL:
        raise ValueError("SQS_QUEUE_URL environment variable is required")

    print("here 1")

    # Initialize AWS clients
    sqs, s3 = get_aws_clients()

    print("here 2")

    # Initialize model and processor
    processor, model = initialize_model_and_processor()

    print("here 3")

    while True:
        try:
            print("here 4")

            message = receive_message(sqs)

            print("here 5")

            process_message(message, sqs, s3, processor, model)

        except Exception as e:
            print(f"Error in main loop: {str(e)}")
            time.sleep(5)


if __name__ == "__main__":
    main()
