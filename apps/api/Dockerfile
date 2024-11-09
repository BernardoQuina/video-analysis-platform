FROM --platform=linux/amd64 node:20-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY ../../. .
RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

RUN npm run build -- --filter=api

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs
COPY --from=installer /app .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the app
CMD ["node", "dist/src/index.js"]


# old

# FROM --platform=linux/amd64 node:20-alpine

# # Set the working directory in the container
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm i

# # Copy the rest of the application code
# COPY . .

# # Build the application
# RUN npm run build

# # Remove devDependencies after build
# RUN npm prune --production

# # Declare build arguments
# ARG NODE_ENV
# ARG FRONTEND_URL

# # Set environment variables
# ENV NODE_ENV=$NODE_ENV
# ENV FRONTEND_URL=$FRONTEND_URL

# # Expose the port the app runs on
# EXPOSE 4000

# # Command to run the app
# CMD ["node", "dist/src/index.js"]