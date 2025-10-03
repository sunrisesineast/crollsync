#!/bin/bash
# Package Crunchyroll Sync Extension for sharing with friends
# This creates a zip file that friends can install directly

echo "📦 Packaging Crunchyroll Sync Extension..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Build the extension first
echo "🔨 Building extension..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

# Create output directory
mkdir -p ../releases

# Get version from manifest
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)

# Create zip file
ZIP_NAME="crunchyroll-sync-v${VERSION}.zip"
echo "📁 Creating ${ZIP_NAME}..."

# Include everything except node_modules, src, and other dev files
zip -r "../releases/${ZIP_NAME}" . \
    -x "node_modules/*" \
    -x "src/*" \
    -x "*.sh" \
    -x "webpack.config.js" \
    -x "package*.json" \
    -x ".git/*" \
    -x "firebase-config.template.js" \
    -x "*.md"

if [ $? -eq 0 ]; then
    echo "✅ Package created successfully!"
    echo "📍 Location: releases/${ZIP_NAME}"
    echo ""
    echo "Share this file with your friends!"
    echo "They can install it by:"
    echo "  1. Unzipping the file"
    echo "  2. Going to chrome://extensions"
    echo "  3. Enabling 'Developer mode'"
    echo "  4. Clicking 'Load unpacked'"
    echo "  5. Selecting the unzipped folder"
else
    echo "❌ Failed to create package"
    exit 1
fi

