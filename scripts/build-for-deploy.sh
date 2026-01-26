#!/bin/bash

# Build script for deployment platforms (handles npm workspace issues)

echo "Starting deployment build process..."

# Install root dependencies
echo "Installing root dependencies..."
npm install --include=dev

# Install client dependencies directly to avoid workspace issues
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies directly
echo "Installing server dependencies..."
cd server
npm install --omit=dev
cd ..

# Build the client
echo "Building client..."
cd client
npm run build
cd ..

echo "Build completed successfully!"