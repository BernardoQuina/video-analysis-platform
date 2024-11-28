import json
import os
import time
from video_llava import initialize_model_and_processor, process_video
from aws_utils import (
    get_aws_clients,
    receive_message,
    delete_message,
    parse_s3_uri,
    get_s3_metadata,
    download_from_s3,
    save_to_dynamodb,
)
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
        field_name = data.get("field_name")

        if not video_s3_uri or not prompt:
            raise ValueError("Missing required fields in message")

        # Format the prompt with required prefix and suffix
        formatted_prompt = format_prompt(prompt)

        return video_s3_uri, formatted_prompt, field_name
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON in message")


def process_message(message, sqs, s3, dynamodb, processor, model):
    field_name = None

    try:
        video_s3_uri, formatted_prompt, field_name = process_message_body(
            message["Body"]
        )
        temp_video_path = None

        try:
            # Parse S3 URI
            bucket, key = parse_s3_uri(video_s3_uri)

            # Extract metadata
            metadata = get_s3_metadata(s3, bucket, key)

            userid = metadata.get("userid", None)
            videoid = metadata.get("videoid", None)

            # Download video
            temp_video_path = download_from_s3(s3, bucket, key)

            # Process video
            result = process_video(temp_video_path, formatted_prompt, processor, model)
            print(f"Processed video result: {result}")

            # Save to DynamoDB
            save_to_dynamodb(
                dynamodb=dynamodb,
                table_name=config.DYNAMODB_TABLE_NAME,
                userid=userid,
                videoid=videoid,
                field_name=field_name,
                field_value=result,
            )

        finally:
            # Clean up temporary file
            if temp_video_path and os.path.exists(temp_video_path):
                os.unlink(temp_video_path)

        # Delete message after successful processing
        delete_message(sqs, message["ReceiptHandle"])

    except Exception as e:
        print(f"Error processing message: {str(e)}")

        if field_name:
            # Determine the appropriate error field based on the provided field_name
            error_field_name = (
                "promptError"
                if field_name == "promptResult"
                else "summaryError"
                if field_name == "summaryResult"
                else None
            )

            # Save error to DynamoDB
            save_to_dynamodb(
                dynamodb=dynamodb,
                table_name=config.DYNAMODB_TABLE_NAME,
                userid=userid,
                videoid=videoid,
                field_name=error_field_name,
                field_value=str(e),
            )


def main():
    if not config.SQS_QUEUE_URL:
        raise ValueError("SQS_QUEUE_URL environment variable is required")

    print("here 1")

    # Initialize AWS clients
    sqs, s3, dynamodb = get_aws_clients()

    print("here 2")

    # Initialize model and processor
    processor, model = initialize_model_and_processor()

    while True:
        try:
            print("here 3")

            message = receive_message(sqs)

            print("message: ", message)

            if message is not None:
                process_message(message, sqs, s3, dynamodb, processor, model)

        except Exception as e:
            print(f"Error in main loop: {str(e)}")
            time.sleep(5)


if __name__ == "__main__":
    main()
