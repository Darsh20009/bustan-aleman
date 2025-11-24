#!/bin/bash
set -e
echo "📦 Installing dependencies (including dev)..."
npm ci --include=dev
echo "🔨 Building application..."
npm run build
echo "✅ Build complete!"
