#!/bin/bash

# Status check script for FreeSpins Bot

echo "📊 FreeSpins Bot Status"
echo "======================"

# PID and lock info
if [ -f "logs/bot.pid" ]; then
    echo "🧾 PID file: $(cat logs/bot.pid)"
else
    echo "🧾 PID file: (none)"
fi

if [ -f "logs/telegram-polling.lock" ]; then
    echo "🔒 Telegram polling lock: present (PID: $(cat logs/telegram-polling.lock 2>/dev/null || echo '?'))"
else
    echo "🔓 Telegram polling lock: none"
fi

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

echo ""
echo "⚙️  Config (masked):"
echo "===================="
mask() { local v="$1"; if [ -z "$v" ]; then echo "(unset)"; else echo "${v:0:3}******${v: -3}"; fi }
echo "DISCORD_TOKEN: $(mask "${DISCORD_TOKEN:-}")"
echo "TELEGRAM_BOT_TOKEN: $(mask "${TELEGRAM_BOT_TOKEN:-}")"
echo "MONITORED_CHANNEL_ID: ${MONITORED_CHANNEL_ID:-(unset)}"
echo "TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID:-(unset)}"