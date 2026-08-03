# Use the specified Node 20 Alpine lightweight image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for efficient layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the remaining frontend source code
COPY . .

# Expose the default Vite port
EXPOSE 5173

# Run the Vite development server and bind to 0.0.0.0
# This is necessary for the container port to be accessible from the host network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
