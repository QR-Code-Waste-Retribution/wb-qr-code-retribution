# Use an official Node.js runtime as the base image with version 16.15.0
FROM node:16.20.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the WebSocket server will listen on
EXPOSE 3000

# Define the command to run the WebSocket server when the container starts
CMD [ "node", "server.js" ]
