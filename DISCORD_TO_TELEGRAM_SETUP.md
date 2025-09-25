# Discord to Telegram Link Forwarding Setup Guide

This bot can now monitor Discord channels and automatically forward links to Telegram with your referral codes!

## Prerequisites

1. **Discord Bot** - Your existing Discord bot
2. **Telegram Bot** - The bot token is already configured: `8035077071:AAG9o-wlKbYn90X_PJyHSReVhVQEEAR3fHw`
3. **Telegram Chat** - You need to know the chat ID where messages should be sent

## Setup Steps

### 1. Find Your Telegram Chat ID

To get your Telegram chat ID:
1. Send a message to your bot (`@YourBotName`)
2. Visit: `https://api.telegram.org/bot8035077071:AAG9o-wlKbYn90X_PJyHSReVhVQEEAR3fHw/getUpdates`
3. Look for the `chat.id` field in the response

### 2. Find Discord Channel ID

To get a Discord channel ID:
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel you want to monitor
3. Select "Copy ID"

### 3. Configure Environment Variables

Update your `.env` file:
```env
# Existing Discord bot settings
DISCORD_TOKEN=your_discord_bot_token
ANNOUNCE_CHANNEL=your_announce_channel_id
MOD_CHANNEL=your_mod_channel_id

# NEW: Discord to Telegram forwarding
MONITORED_CHANNEL_ID=channel_id_to_monitor_for_links
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 4. Configure Your Referral Codes

Edit `affiliateLinks.json` and replace the example codes with your actual referral codes:

```json
{
  "stake.com": {
    "domain": "stake.com",
    "referralParam": "ref",
    "userReferralCode": "YOUR_ACTUAL_STAKE_CODE",
    "patterns": ["stake\\.com", "stake\\.us"]
  },
  "bc.game": {
    "domain": "bc.game",
    "referralParam": "ref", 
    "userReferralCode": "YOUR_ACTUAL_BC_CODE",
    "patterns": ["bc\\.game"]
  }
}
```

### 5. Discord Bot Permissions

Make sure your Discord bot has these permissions:
- Read Messages
- View Channel
- Send Messages (for existing functionality)

The bot will automatically monitor messages in the configured channel.

## How It Works

1. **Message Detection**: Bot monitors the specified Discord channel for new messages
2. **Link Extraction**: Finds all URLs in messages using regex pattern matching
3. **Referral Processing**: 
   - Identifies casino domains from `affiliateLinks.json`
   - Removes existing referral parameters (ref, aff, code, partner, etc.)
   - Adds your referral code using the specified parameter
4. **Telegram Forwarding**: Sends formatted message to your Telegram chat

## Testing

Test the functionality without sending actual messages:

```bash
# Test link processing
node test.js

# Test Telegram message formatting  
node testTelegram.js
```

## Troubleshooting

**Bot not responding to messages:**
- Check `MONITORED_CHANNEL_ID` is correct
- Verify bot has proper Discord permissions
- Check bot is in the channel you're monitoring

**Links not being processed:**
- Check the domain is listed in `affiliateLinks.json`
- Verify the regex patterns match the domains
- Test with `node test.js`

**Telegram messages not sending:**
- Verify `TELEGRAM_CHAT_ID` is correct
- Make sure you've started a conversation with the bot
- Check bot logs for error messages

## Adding New Casinos

To add support for new casino affiliate programs:

1. Add entry to `affiliateLinks.json`:
```json
"newcasino.com": {
  "domain": "newcasino.com",
  "referralParam": "ref",
  "userReferralCode": "your_referral_code",
  "patterns": ["newcasino\\.com", "newcasino\\.net"]
}
```

2. Test with your specific URLs using `node test.js`

## Security Notes

- Never commit your `.env` file
- Keep your Telegram bot token secure
- Referral codes in `affiliateLinks.json` will be visible in the repository
- Consider using environment variables for sensitive referral codes if needed