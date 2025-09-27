const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import utilities
const { processMessage } = require('./utils/linkProcessor');
const TelegramBot = require('./utils/telegramBot');
const CatchupProcessor = require('./utils/catchup');
const DiscordLogger = require('./utils/discordLogger');
const { handleTelegramReferralCommand } = require('./utils/telegramCommands');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});
client.commands = new Collection();

const vettedCasinos = require('./vettedCasinos.json');

// Initialize Telegram bot (token from environment)
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
if (!telegramToken) {
  console.error('Missing TELEGRAM_BOT_TOKEN in environment. Please set it in your .env file.');
  process.exit(1);
}
const telegramBot = new TelegramBot(telegramToken);

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// Handle interactions
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    const [action, casino, userId] = interaction.customId.split('_');
    const announceChannel = interaction.guild.channels.cache.get(process.env.ANNOUNCE_CHANNEL);
    const freespinsRoleId = '1378603138172321862'; // Replace with your actual role ID

    if (!announceChannel) {
      return interaction.reply({ content: '⚠️ Announcement channel not found.', ephemeral: true });
    }

    if (action === 'approve') {
      const originalMsg = interaction.message.content;
      await announceChannel.send({
        content: `🎰 <@&${freespinsRoleId}> **${casino.toUpperCase()} Free Spins!**
🔗 Extracted from mod approval.
${originalMsg}`,
        allowedMentions: { roles: [freespinsRoleId] }
      });
      await interaction.update({ content: `✅ Approved by <@${interaction.user.id}>`, components: [] });
    }

    if (action === 'reject') {
      await interaction.update({ content: `❌ Rejected by <@${interaction.user.id}>`, components: [] });
    }
  }
});

// Monitor messages for links to forward to Telegram
client.on('messageCreate', async message => {
  // Skip bot messages - allow messages without content but with embeds
  if (message.author.bot) return;
  
  // Skip if no content and no embeds
  if (!message.content && (!message.embeds || message.embeds.length === 0)) return;
  
  // Check if this is a monitored channel (you can configure this via environment variable)
  const monitoredChannelId = process.env.MONITORED_CHANNEL_ID;
  if (!monitoredChannelId || message.channelId !== monitoredChannelId) return;
  
  try {
    // Process the full message (content + embeds) for links
    const messageData = processMessage(message);
    
    if (messageData && messageData.hasLinks) {
      console.log(`Found ${messageData.links.length} links in message from ${message.author.username}`);
      
      // Format and send to Telegram
      const telegramMessage = telegramBot.formatMessage(messageData, message);
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;
      
      if (telegramChatId) {
        await telegramBot.sendMessage(telegramChatId, telegramMessage);
        console.log('✅ Successfully forwarded links to Telegram');
      } else {
        console.warn('⚠️ No Telegram chat ID configured');
      }
    }
  } catch (error) {
    console.error('❌ Error processing message for Telegram forwarding:', error);
  }
});

client.once('clientReady', async () => {
  console.log(`Bot ready as ${client.user.tag}`);
  
  // Initialize Discord logger
  const discordLogger = new DiscordLogger(client);
  
  // Log startup
  await discordLogger.logStartup();
  
  // Initialize catchup processor
  const catchupProcessor = new CatchupProcessor(client, telegramBot);
  
  // Run one-time catchup for today's messages (only runs once per day)
  console.log('🔄 Checking for catchup messages from today...');
  try {
    const result = await catchupProcessor.runOnceCatchup();
    
    if (result.skipped) {
      console.log('ℹ️  Catchup already completed for today');
    } else if (result.processed === 0) {
      console.log('ℹ️  No messages to catch up from today');
    } else {
      console.log(`✅ Catchup complete: ${result.processed} processed, ${result.sent} sent to Telegram`);
    }
    
    // Log catchup results to Discord
    await discordLogger.logCatchup(result);
    
  } catch (error) {
    console.error('❌ Error during catchup process:', error);
    await discordLogger.logError(error, 'catchup process');
  }
  
  console.log('🚀 Bot is now monitoring for new messages...');

  // Start Telegram command polling (non-blocking)
  (async () => {
    // Register Telegram commands for better UX
    try {
      await telegramBot.setMyCommands([
        { command: 'ref', description: 'Get a referral link (usage: /ref <casino|domain> [url])' },
        { command: 'referral', description: 'Alias for /ref' },
      ]);
    } catch (e) {
      console.warn('Could not set Telegram commands:', e.message);
    }

    let offset = 0;
    while (true) {
      try {
        const updates = await telegramBot.getUpdates(offset, 30);
        if (updates.ok && Array.isArray(updates.result)) {
          for (const update of updates.result) {
            offset = update.update_id + 1;
            const msg = update.message || update.edited_message;
            if (!msg || !msg.text) continue;
            const text = msg.text.trim();

            if (/^\/(ref|referral)(@\w+)?\b/i.test(text)) {
              await handleTelegramReferralCommand(telegramBot, msg.chat.id, text);
            }
          }
        }
      } catch (err) {
        console.warn('Telegram polling error:', err.message);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  })();
});

client.login(process.env.DISCORD_TOKEN);
