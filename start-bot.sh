#!/bin/bash

# Auto-start script for FreeSpins Bot
# Make this file executable with: chmod +x start-bot.sh

set -euo pipefail

echo "🚀 Starting FreeSpins Bot..."

# Ensure logs directory exists
mkdir -p logs

# Load environment variables if .env exists
if [ -f .env ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | xargs -I{} echo {})
fi

# Check if bot is already running
if pgrep -f "node index.js" > /dev/null; then
        echo "⚠️  Bot is already running!"
        echo "Use './stop-bot.sh' to stop it first"
        exit 1
fi

# Start the bot in background
nohup node index.js > logs/bot.log 2>&1 &
BOT_PID=$!

echo "✅ Bot started successfully!"
echo "📋 Process ID: $BOT_PID"
echo "📝 Logs: tail -f logs/bot.log"
echo "🛑 Stop: ./stop-bot.sh"

# Save PID for stopping later
echo $BOT_PID > logs/bot.pid