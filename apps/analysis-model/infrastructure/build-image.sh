#!/bin/bash

# Retrieve the short Git commit SHA
GIT_SHA=$(git rev-parse --short HEAD)

# Define the image name
IMAGE_NAME="analysis-model/model"

# Build the Docker image with the Git commit SHA as the tag
docker build -t $IMAGE_NAME:$GIT_SHA .

# Optionally, also tag the image with 'latest'
docker tag $IMAGE_NAME:$GIT_SHA $IMAGE_NAME:latest

echo "Docker image $IMAGE_NAME:$GIT_SHA built successfully."
