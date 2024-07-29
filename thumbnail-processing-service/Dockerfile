# Stage 1: Build stage
FROM node:18 AS builder

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# RUN npm install jimp

# Bundle app source inside the docker image
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production stage
FROM node:18

# Install jimp in the container
# RUN npm install jimp

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production
RUN npm install jimp

# Copy built app from the builder stage
COPY --from=builder /app/dist ./dist

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "run", "serve" ]