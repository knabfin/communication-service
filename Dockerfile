# Use Node 22 LTS image
FROM node:22

# Set working directory inside container
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

#  Clean old dist folder before building
RUN rm -rf dist && npm run build

# Expose port 80 (ECS default)
EXPOSE 3000

# Set environment variable for NestJS port
ENV PORT=3000

# Start the app
CMD ["npm", "run", "start:prod"]
