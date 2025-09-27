
#!/bin/bash

# Stop script for FreeSpins Bot

set -euo pipefail

echo "🛑 Stopping FreeSpins Bot..."

LOCK_FILE="logs/telegram-polling.lock"

# Stop by PID if available
if [ -f "logs/bot.pid" ]; then
    BOT_PID=$(cat logs/bot.pid)
    if kill -0 "$BOT_PID" 2>/dev/null; then
        kill "$BOT_PID" 2>/dev/null || true
        # Wait briefly for clean exit
            for i in {1..10}; do
                if kill -0 "$BOT_PID" 2>/dev/null; then
                    sleep 0.2
                else
                    break
                fi
            done
        if kill -0 "$BOT_PID" 2>/dev/null; then
            echo "⏳ Force killing process $BOT_PID"
            kill -9 "$BOT_PID" 2>/dev/null || true
        fi
        echo "✅ Bot stopped (PID: $BOT_PID)"
    else
        echo "⚠️  Bot PID file present but process not running"
    fi
    rm -f logs/bot.pid
else
    echo "ℹ️  No PID file; attempting fallback by process name"
    pkill -f "node index.js" 2>/dev/null || true
fi

# Clean up Telegram polling lock (prevents duplicate pollers)
if [ -f "$LOCK_FILE" ]; then
    echo "🧹 Removing Telegram polling lock"
    rm -f "$LOCK_FILE"
fi

echo "✅ Stop routine completed"
exit 0