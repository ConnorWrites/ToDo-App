# Use a stable Node.js version compatible with older Docker
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY . .

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY  . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
