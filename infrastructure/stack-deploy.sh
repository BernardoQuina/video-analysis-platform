#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env file
set -o allexport
source "$SCRIPT_DIR/../.env"
set +o allexport

STACK_NAME="main-deployment"
TEMPLATE_FILE="$SCRIPT_DIR/main.yml"

# Function to check if stack exists
stack_exists() {
  aws cloudformation describe-stacks --stack-name "$STACK_NAME" &>/dev/null
  return $?
}

# Check if the stack already exists
if stack_exists; then
  echo "Updating existing CloudFormation stack: $STACK_NAME"
  UPDATE_OUTPUT=$(aws cloudformation update-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://"$TEMPLATE_FILE" \
    --parameters ParameterKey=AccountId,ParameterValue="$ACCOUNT_ID" \
    ParameterKey=StackTemplatesS3BucketName,ParameterValue="$STACK_TEMPLATES_S3_BUCKET_NAME" \
    ParameterKey=LambdasCodeS3BucketName,ParameterValue="$LAMBDAS_CODE_S3_BUCKET_NAME" \
    ParameterKey=VideoStorageS3BucketName,ParameterValue="$VIDEO_STORAGE_S3_BUCKET_NAME" \
    ParameterKey=EC2KeyPairName,ParameterValue="$EC2_KEY_PAIR_NAME" \
    ParameterKey=APIECRRepositoryName,ParameterValue="$API_ECR_REPOSITORY_NAME" \
    ParameterKey=AnalysisModelECRRepositoryName,ParameterValue="$ANALYSIS_MODEL_ECR_REPOSITORY_NAME" \
    ParameterKey=AnalysisModelECSAMI,ParameterValue="$ANALYSIS_MODEL_ECS_AMI" \
    ParameterKey=FrontendDomainName,ParameterValue="$FRONTEND_DOMAIN_NAME" \
    ParameterKey=APIDomainName,ParameterValue="$API_DOMAIN_NAME" \
    ParameterKey=HostedZoneId,ParameterValue="$HOSTED_ZONE_ID" \
    ParameterKey=GoogleClientId,ParameterValue="$GOOGLE_CLIENT_ID" \
    ParameterKey=GoogleClientSecret,ParameterValue="$GOOGLE_CLIENT_SECRET" \
    ParameterKey=AppDomainPrefix,ParameterValue="$APP_DOMAIN_PREFIX" \
    --capabilities CAPABILITY_IAM 2>&1)

  if [[ $UPDATE_OUTPUT == *"No updates are to be performed"* ]]; then
    echo "No updates are to be performed."
  elif [[ $? -eq 0 ]]; then
    echo "Stack update initiated. Check AWS Console for progress."
  else
    echo "Error updating stack: $UPDATE_OUTPUT"
    exit 1
  fi
else
  echo "Creating new CloudFormation stack: $STACK_NAME"
  CREATE_OUTPUT=$(aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://"$TEMPLATE_FILE" \
    --parameters ParameterKey=AccountId,ParameterValue="$ACCOUNT_ID" \
    ParameterKey=StackTemplatesS3BucketName,ParameterValue="$STACK_TEMPLATES_S3_BUCKET_NAME" \
    ParameterKey=LambdasCodeS3BucketName,ParameterValue="$LAMBDAS_CODE_S3_BUCKET_NAME" \
    ParameterKey=VideoStorageS3BucketName,ParameterValue="$VIDEO_STORAGE_S3_BUCKET_NAME" \
    ParameterKey=EC2KeyPairName,ParameterValue="$EC2_KEY_PAIR_NAME" \
    ParameterKey=APIECRRepositoryName,ParameterValue="$API_ECR_REPOSITORY_NAME" \
    ParameterKey=AnalysisModelECRRepositoryName,ParameterValue="$ANALYSIS_MODEL_ECR_REPOSITORY_NAME" \
    ParameterKey=AnalysisModelECSAMI,ParameterValue="$ANALYSIS_MODEL_ECS_AMI" \
    ParameterKey=FrontendDomainName,ParameterValue="$FRONTEND_DOMAIN_NAME" \
    ParameterKey=APIDomainName,ParameterValue="$API_DOMAIN_NAME" \
    ParameterKey=HostedZoneId,ParameterValue="$HOSTED_ZONE_ID" \
    ParameterKey=GoogleClientId,ParameterValue="$GOOGLE_CLIENT_ID" \
    ParameterKey=GoogleClientSecret,ParameterValue="$GOOGLE_CLIENT_SECRET" \
    ParameterKey=AppDomainPrefix,ParameterValue="$APP_DOMAIN_PREFIX" \
    --capabilities CAPABILITY_IAM 2>&1)

  if [[ $? -eq 0 ]]; then
    echo "Stack creation initiated. Check AWS Console for progress."
  else
    echo "Error creating stack: $CREATE_OUTPUT"
    exit 1
  fi
fi

echo "Script completed successfully."
