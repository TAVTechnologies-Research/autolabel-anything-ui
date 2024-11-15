# Use an official Node.js image
FROM node:16-alpine
LABEL authors="denizpeker"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app runs in
EXPOSE 3000

# Start the app
CMD ["npm", "start"]