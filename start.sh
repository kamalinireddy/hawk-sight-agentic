#!/bin/bash
# Hawk Sight - one-command setup and start
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env for you. Open it and paste your free Groq API key,"
  echo "   then run this script again."
  echo "   Get a key at: https://console.groq.com (API Keys -> Create API Key)"
  echo ""
  exit 1
fi

if ! grep -q "your-free-groq-key-here" .env; then
  echo "✅ API key found in .env"
else
  echo ""
  echo "⚠️  .env still has the placeholder key. Open .env and paste your real"
  echo "   Groq API key in place of 'your-free-groq-key-here', then run this again."
  echo ""
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies (first run only)..."
  npm install
fi

echo "🦅 Starting Hawk Sight..."
npm start
