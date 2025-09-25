FreeSpins Finder (Discord Bot)

FreeSpins Finder is a Discord bot that automates the submission and announcement of non-referral free spin links from community members. It streamlines the process, prevents chat spam, and routes new casino links for mod approval — so your community stays clean, fair, and focused.

**NEW: Discord to Telegram Link Forwarding** - Monitor Discord channels and automatically forward links to Telegram with your referral codes!

Features
- Slash command `/submitspin` for submitting free spins
- Automatically posts vetted links to the #free-spins-announcements channel
- Routes unvetted casinos to a mod channel for approval
- Blocks referral links (except Seal-approved)
- **NEW**: Monitor Discord channels and forward links to Telegram
- **NEW**: Automatically replace referral codes with your own
- **NEW**: Support for multiple casino affiliate programs
- Easy to expand casino vetting list (via JSON or DB later)

Slash Commands 
```bash
/submitspin casino_name:<casino> link:<url> description:<optional>
```

Setup
1. Clone repo:
```bash
git clone https://github.com/jmenichole/freespins-sub-bot.git
cd freespins-sub-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
MOD_CHANNEL=mod-review
ANNOUNCE_CHANNEL=free-spins-announcements

# Discord to Telegram Forwarding (NEW)
MONITORED_CHANNEL_ID=discord_channel_id_to_monitor
TELEGRAM_CHAT_ID=telegram_chat_id_to_send_messages
```

4. Configure your affiliate links in `affiliateLinks.json`:
```json
{
  "stake.com": {
    "domain": "stake.com",
    "referralParam": "ref",
    "userReferralCode": "your_stake_referral_code",
    "patterns": ["stake\\.com", "stake\\.us"]
  }
}
```

4. Run bot:
```bash
node index.js
```

## Discord to Telegram Forwarding

The bot now supports monitoring Discord channels and forwarding links to Telegram with automatic referral code replacement.

### How it works:
1. Bot monitors specified Discord channel for messages containing links
2. Extracts links and identifies supported casino domains
3. Removes existing referral codes and replaces with your codes
4. Formats and sends processed links to your Telegram chat

### Configuration:
- Set `MONITORED_CHANNEL_ID` to the Discord channel you want to monitor
- Set `TELEGRAM_CHAT_ID` to your Telegram chat ID where messages should be sent
- Update `affiliateLinks.json` with your referral codes
- Telegram bot token is pre-configured: `8035077071:AAG9o-wlKbYn90X_PJyHSReVhVQEEAR3fHw`

### Testing:
```bash
# Test link processing
node test.js

# Test Telegram message formatting
node testTelegram.js
```


Structure
```
/FreeSpinsFinderBot
├── index.js                # Bot entry point
├── vettedCasinos.json      # List of pre-approved casinos
├── affiliateLinks.json     # Affiliate/referral code configuration (NEW)
├── .env                    # Secrets (not tracked in git)
├── .env.example            # Environment variables template (NEW)
├── package.json            # Dependencies and scripts (NEW)
├── utils/                  # Utility modules (NEW)
│   ├── linkProcessor.js    # Link extraction and processing (NEW)
│   └── telegramBot.js      # Telegram API integration (NEW)
├── commands/
│   └── submitspin.js       # Slash command logic
├── test.js                 # Link processing tests (NEW)
├── testTelegram.js         # Telegram integration tests (NEW)
└── .gitignore              # Environment protection
```

Contributing
This project was originally built for internal use by the StakeStats mod team — but contributions, ideas, and forks are welcome!

Disclaimer
This bot does not promote gambling. It's meant to manage free community promos in Discord servers where such sharing is already allowed. Use responsibly.

Credits
Built by [@jmenichole](https://github.com/jmenichole) and powered by Discord.js.
