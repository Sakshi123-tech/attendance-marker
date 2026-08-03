# Base stage for common configurations
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Expose port 5000 as requested
EXPOSE 5000

# ---------------------------------------------------
# Development stage
# ---------------------------------------------------
FROM base AS development

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the development script
CMD ["npm", "run", "dev"]

# ---------------------------------------------------
# Production stageh
# ---------------------------------------------------
FROM base AS production

# Install only production dependencies for a lighter image
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Run the production script
CMD ["npm", "start"]
