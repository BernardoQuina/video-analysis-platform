import boto3
import tempfile
import os
import config

def get_aws_clients():
    sqs = boto3.client('sqs', region_name=config.AWS_REGION)
    s3 = boto3.client('s3', region_name=config.AWS_REGION)
    return sqs, s3

def receive_message(sqs):
    response = sqs.receive_message(
        QueueUrl=config.SQS_QUEUE_URL,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=20
    )
    return response.get('Messages', [])[0]

def delete_message(sqs, receipt_handle):
    sqs.delete_message(
        QueueUrl=config.SQS_QUEUE_URL,
        ReceiptHandle=receipt_handle
    )

def parse_s3_uri(s3_uri):
    parts = s3_uri.replace("s3://", "").split("/")
    bucket = parts[0]
    key = "/".join(parts[1:])
    return bucket, key

def download_from_s3(s3, s3_uri):
    bucket, key = parse_s3_uri(s3_uri)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    
    try:
        s3.download_file(bucket, key, temp_file.name)
        return temp_file.name
    except Exception as e:
        os.unlink(temp_file.name)
        raise e