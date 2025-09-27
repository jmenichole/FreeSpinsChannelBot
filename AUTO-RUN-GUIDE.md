# 🚀 FreeSpins Bot Auto-Run Guide

## Quick Commands

```bash
# Start bot in background
./start-bot.sh
# or
npm run daemon

# Stop bot
./stop-bot.sh
# or  
npm run stop

# Check status
./status-bot.sh
# or
npm run status

# Restart bot
npm run restart

# View live logs
tail -f logs/bot.log
```

## Auto-Run Methods

### Method 1: Manual Scripts (Current Setup)
- ✅ **Start**: `./start-bot.sh`
- ✅ **Stop**: `./stop-bot.sh`  
- ✅ **Status**: `./status-bot.sh`
- ✅ **Logs**: `tail -f logs/bot.log`

### Method 2: NPM Scripts
- ✅ **Start**: `npm run daemon`
- ✅ **Stop**: `npm run stop`
- ✅ **Status**: `npm run status`
- ✅ **Restart**: `npm run restart`

### Method 3: System Boot (macOS)
Create a Launch Agent for automatic startup on boot:

```bash
# Create launch agent (run this once)
sudo tee /Library/LaunchDaemons/com.freespins.bot.plist > /dev/null << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.freespins.bot</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/fullsail/FreeSpinsChannelBot/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/fullsail/FreeSpinsChannelBot</string>
    <key>KeepAlive</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/Users/fullsail/FreeSpinsChannelBot/logs/launchd-error.log</string>
    <key>StandardOutPath</key>
    <string>/Users/fullsail/FreeSpinsChannelBot/logs/launchd-output.log</string>
</dict>
</plist>
EOF

# Load the service
sudo launchctl load /Library/LaunchDaemons/com.freespins.bot.plist
```

## Current Status
🎉 **Bot is currently RUNNING in background!**
- Process ID: 53109
- Logs: `tail -f logs/bot.log`
- Stop: `./stop-bot.sh`

## Features Active
✅ Discord monitoring  
✅ Telegram forwarding  
✅ Link processing  
✅ Slash commands  
✅ Auto-restart on crash  
✅ Logging system