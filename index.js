const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import utilities
const { processMessage } = require('./utils/linkProcessor');
const TelegramBot = require('./utils/telegramBot');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});
client.commands = new Collection();

const vettedCasinos = require('./vettedCasinos.json');

// Initialize Telegram bot
const telegramBot = new TelegramBot('8035077071:AAG9o-wlKbYn90X_PJyHSReVhVQEEAR3fHw');

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
  // Skip bot messages and messages without content
  if (message.author.bot || !message.content) return;
  
  // Check if this is a monitored channel (you can configure this via environment variable)
  const monitoredChannelId = process.env.MONITORED_CHANNEL_ID;
  if (!monitoredChannelId || message.channelId !== monitoredChannelId) return;
  
  try {
    // Process the message for links
    const messageData = processMessage(message.content);
    
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

client.once('ready', () => {
  console.log(`Bot ready as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
