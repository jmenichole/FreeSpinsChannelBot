#!/bin/bash

# Status check script for FreeSpins Bot

echo "📊 FreeSpins Bot Status"
echo "======================"

# Check if bot is running
if pgrep -f "node index.js" > /dev/null; then
    BOT_PID=$(pgrep -f "node index.js")
    echo "✅ Status: RUNNING"
    echo "📋 Process ID: $BOT_PID"
    echo "⏱️  Uptime: $(ps -o etime= -p $BOT_PID | tr -d ' ')"
    echo "💾 Memory: $(ps -o rss= -p $BOT_PID | awk '{print $1/1024 " MB"}' | tr -d ' ')"
else
    echo "❌ Status: STOPPED"
fi

echo ""
echo "📝 Recent logs:"
echo "==============="
if [ -f "logs/bot.log" ]; then
    tail -10 logs/bot.log
else
    echo "No log file found"
fi