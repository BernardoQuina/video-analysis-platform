#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env file
set -o allexport
source "$SCRIPT_DIR/../.env"
set +o allexport

STACK_NAME="frontend-deployment"
TEMPLATE_FILE="$SCRIPT_DIR/frontend-stack.yml"

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
    --parameters ParameterKey=BucketName,ParameterValue="$FRONTEND_S3_BUCKET_NAME" \
    ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
    ParameterKey=HostedZoneId,ParameterValue="$HOSTED_ZONE_ID" \
    ParameterKey=CertificateArn,ParameterValue="$CERTIFICATE_ARN" 2>&1)

  # When there are no updates aws cloudfromation exits with an error but we want to handle that case gracefully and just output that message.
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
    --parameters ParameterKey=BucketName,ParameterValue="$FRONTEND_S3_BUCKET_NAME" \
    ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
    ParameterKey=HostedZoneId,ParameterValue="$HOSTED_ZONE_ID" \
    ParameterKey=CertificateArn,ParameterValue="$CERTIFICATE_ARN" 2>&1)

  if [[ $? -eq 0 ]]; then
    echo "Stack creation initiated. Check AWS Console for progress."
  else
    echo "Error creating stack: $CREATE_OUTPUT"
    exit 1
  fi
fi

echo "Script completed successfully."
