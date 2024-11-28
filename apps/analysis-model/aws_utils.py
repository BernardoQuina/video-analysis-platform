import boto3
import tempfile
import os
import config


def get_aws_clients():
    sqs = boto3.client("sqs", region_name=config.AWS_REGION)
    s3 = boto3.client("s3", region_name=config.AWS_REGION)
    dynamodb = boto3.client("dynamodb", region_name=config.AWS_REGION)
    return sqs, s3, dynamodb


def receive_message(sqs):
    response = sqs.receive_message(
        QueueUrl=config.SQS_QUEUE_URL, MaxNumberOfMessages=1, WaitTimeSeconds=20
    )
    messages = response.get("Messages", [])

    if len(messages) == 0:
        return None

    return messages[0]


def delete_message(sqs, receipt_handle):
    sqs.delete_message(QueueUrl=config.SQS_QUEUE_URL, ReceiptHandle=receipt_handle)


def parse_s3_uri(s3_uri):
    parts = s3_uri.replace("s3://", "").split("/")
    bucket = parts[0]
    key = "/".join(parts[1:])
    return bucket, key


def download_from_s3(s3, bucket, key):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")

    try:
        s3.download_file(bucket, key, temp_file.name)
        return temp_file.name
    except Exception as e:
        os.unlink(temp_file.name)
        raise e


def get_s3_metadata(s3, bucket, key):
    """
    Retrieve metadata from the S3 object.
    """
    response = s3.head_object(Bucket=bucket, Key=key)
    metadata = response.get("Metadata", {})
    return metadata


def save_to_dynamodb(dynamodb, table_name, userid, videoid, field_name, field_value):
    """
    Save or update a specific field in DynamoDB for a given userid and videoid without overwriting other fields.

    :param dynamodb: DynamoDB client
    :param table_name: Name of the DynamoDB table
    :param userid: User ID
    :param videoid: Video ID
    :param field_name: Name of the field to update
    :param field_value: Value of the field to update
    """
    try:
        # Construct pk and sk based on the specified format
        pk = f"$main#userId_{userid}"
        sk = f"$user#videos_1#id_{videoid}"

        # Perform an update operation to set the specified field
        dynamodb.update_item(
            TableName=table_name,
            Key={
                "pk": {"S": pk},
                "sk": {"S": sk},
            },
            UpdateExpression="SET #field = :value",
            ExpressionAttributeNames={
                "#field": field_name,  # Field to update
            },
            ExpressionAttributeValues={
                ":value": {"S": field_value},  # New value for the field
            },
        )
        print(
            f"Field '{field_name}' successfully updated in DynamoDB for pk: {pk}, sk: {sk}"
        )
    except Exception as e:
        print(f"Error updating DynamoDB: {str(e)}")
        raise
