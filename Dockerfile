# Multi-stage Dockerfile for Vijayasri Badminton Manager

# Stage 1: Build the client
FROM node:20-alpine AS client-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install --include=dev

# Install client dependencies directly to avoid workspace issues
WORKDIR /app/client
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm install @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl @rollup/rollup-linux-arm64-gnu @rollup/rollup-linux-arm64-musl --save-optional

# Copy client source
WORKDIR /app
COPY client/ ./client/

# Build the client
WORKDIR /app/client
RUN npm run build

# Go back to app root
WORKDIR /app

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy server files
COPY server/ ./server/

# Copy built client from previous stage
COPY --from=client-builder /app/client/dist ./client/dist

# Copy assets
COPY server/assets ./server/assets

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["npm", "run", "start:prod"]