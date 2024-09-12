FROM --platform=linux/amd64 node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 4000

# Command to run the app
CMD ["node", "dist/src/index.js"]