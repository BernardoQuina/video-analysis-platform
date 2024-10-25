import os

AWS_REGION = os.getenv("AWS_REGION", "eu-west-1")
SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
MODEL_NAME = "LanguageBind/Video-LLaVA-7B-hf"
MAX_NEW_TOKENS = 100
PROMPT_PREFIX = "USER: <video>\n"
PROMPT_SUFFIX = " ASSISTANT:"
