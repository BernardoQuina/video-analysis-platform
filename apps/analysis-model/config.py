import os

AWS_REGION = os.getenv("AWS_REGION")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME")
MODEL_NAME = "LanguageBind/Video-LLaVA-7B-hf"
MAX_NEW_TOKENS = 5000
PROMPT_PREFIX = "USER: <video>\n"
PROMPT_SUFFIX = " ASSISTANT:"
