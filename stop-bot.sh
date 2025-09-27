#!/bin/bash

# Stop script for FreeSpins Bot

echo "🛑 Stopping FreeSpins Bot..."

# Check for PID file
if [ -f "logs/bot.pid" ]; then
    BOT_PID=$(cat logs/bot.pid)
    if kill -0 $BOT_PID 2>/dev/null; then
        kill $BOT_PID
        echo "✅ Bot stopped (PID: $BOT_PID)"
        rm logs/bot.pid
    else
        echo "⚠️  Bot process not found"
        rm logs/bot.pid
    fi
else
    # Fallback: kill by process name
    pkill -f "node index.js"
    if [ $? -eq 0 ]; then
        echo "✅ Bot stopped"
    else
        echo "⚠️  No bot process found"
    fi
fi