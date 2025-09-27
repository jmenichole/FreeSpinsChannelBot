# 📥 Catchup Feature Documentation

## Overview
The catchup feature automatically processes all messages with links from today that were sent **before** the bot started running. This ensures no affiliate opportunities are missed when the bot goes offline temporarily.

## How It Works

### 🔄 Automatic Catchup (Default)
- Runs **once per day** when the bot starts
- Fetches all messages from today (00:00:00 to now)
- Only processes messages with links
- Replaces affiliate codes and forwards to Telegram
- Creates a flag file to prevent duplicate processing

### 📊 Manual Catchup (Discord Command)
Use the `/catchup` slash command in Discord:
- `/catchup` - Run catchup if not done today
- `/catchup force:true` - Force run even if already completed

### 🧪 Test Catchup
```bash
# Test what messages would be processed (no sending)
node testCatchup.js
# or
npm run test-catchup
```

## Features

### ✅ Smart Processing
- Only processes messages from **today** (00:00:00 onwards)
- Only processes messages with **links**
- Skips messages already processed
- Respects rate limits with delays

### 🛡️ Safety Features
- **One-time per day**: Won't duplicate process messages
- **Rate limiting**: 1 second delay between Telegram sends
- **Error handling**: Continues processing if one message fails
- **Logging**: Detailed logs of what was processed

### 📱 Telegram Integration
- Same formatting as real-time messages
- Clearly marked as "Catchup" messages
- Includes original timestamp and author
- Shows which links were modified

## File Structure

```
utils/
├── catchupProcessor.js     # Main catchup logic
commands/
├── catchup.js             # Discord slash command
logs/
├── catchup-completed.flag # Daily flag file
testCatchup.js             # Test script
```

## Example Output

### Console Logs
```
🔄 Checking for catchup messages from today...
🚀 Starting catchup process for today's messages...
🔍 Fetching messages from #daily-casino-extras...
✅ Fetched 25 messages, found 3 with links from today
📝 Processing 3 messages...
✅ Sent message from username (1/2/2025, 10:30:00 AM)
✅ Sent message from username2 (1/2/2025, 2:15:00 PM)
🎉 Catchup complete! Processed: 3, Sent: 2
```

### Telegram Message Format
```
🔗 Catchup: Links from Discord
👤 From: username
📢 Channel: daily-casino-extras
⏰ Sent: 1/2/2025, 10:30:00 AM

🎰 Link 1:
https://stake.com/casino/games/sweet-bonanza?c=LAYP68hb
✅ Referral code updated

💬 Original message:
Check out this amazing bonus!
```

## Commands

### Bot Management
```bash
# Start bot (includes automatic catchup)
./start-bot.sh

# Test catchup without sending
npm run test-catchup

# Manual restart (will run catchup again)
npm run restart
```

### Discord Commands
- `/catchup` - Standard catchup
- `/catchup force:true` - Force catchup

## Configuration

The catchup feature uses these environment variables:
- `MONITORED_CHANNEL_ID` - Discord channel to monitor
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Telegram chat to send to

## Troubleshooting

### No messages found
- Check if `MONITORED_CHANNEL_ID` is correct
- Verify bot has permission to read message history
- Ensure messages contain links (http/https URLs)

### Permission errors
- Bot needs `Read Message History` permission
- Bot needs `View Channel` permission
- Ensure bot is member of the guild

### Rate limiting
- Built-in 1 second delays between sends
- Discord: 100 messages per API call
- Telegram: Respects bot API limits

## Technical Details

### Message Fetching
- Uses Discord API `channel.messages.fetch()`
- Processes in batches of 100 messages
- Stops when reaching yesterday's messages
- Filters for messages containing URLs

### Link Processing
- Uses same `linkProcessor.js` as real-time processing
- Replaces affiliate codes using `affiliateLinks.json`
- Preserves original message structure

### Telegram Formatting
- HTML formatting for readability
- Includes metadata (author, channel, timestamp)
- Shows modification status for each link
- Maintains link functionality