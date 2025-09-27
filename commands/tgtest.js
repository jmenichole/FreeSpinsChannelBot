const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tgtest')
    .setDescription('Send a test message to the configured Telegram chat')
    .addStringOption(opt => opt
      .setName('text')
      .setDescription('Optional text to send (default: test ping)')
      .setRequired(false)
    ),
  async execute(interaction) {
    const TelegramBot = require('../utils/telegramBot');
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return interaction.reply({ content: '❌ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set in environment.', ephemeral: true });
    }
    const bot = new TelegramBot(token);
    const txt = interaction.options.getString('text') || '✅ Telegram test ping from Discord';
    try {
      await bot.sendMessage(chatId, txt, { disable_web_page_preview: true });
      await interaction.reply({ content: `Sent to Telegram chat: ${chatId}`, ephemeral: true });
    } catch (e) {
      await interaction.reply({ content: `❌ Failed to send Telegram test: ${e.message}`, ephemeral: true });
    }
  }
};