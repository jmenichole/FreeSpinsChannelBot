const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CatchupProcessor = require('../utils/catchup');
const TelegramBot = require('../utils/telegramBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catchup')
    .setDescription('Manually run catchup for today\'s messages')
    .addBooleanOption(option =>
      option.setName('force')
        .setDescription('Force catchup even if already completed today')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const force = interaction.options.getBoolean('force') || false;
      const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
      const catchupProcessor = new CatchupProcessor(interaction.client, telegramBot);

      let result;
      
      if (force) {
        console.log('🔄 Force catchup requested by', interaction.user.username);
        result = await catchupProcessor.processTodayMessages();
      } else {
        result = await catchupProcessor.runOnceCatchup();
      }

      let responseMessage;
      
      if (result.skipped && !force) {
        responseMessage = '✅ Catchup already completed for today. Use `force: true` to run again.';
      } else if (result.processed === 0) {
        responseMessage = 'ℹ️ No messages with links found from today to process.';
      } else {
        responseMessage = `✅ Catchup completed!\n📊 **Stats:**\n- Messages processed: ${result.processed}\n- Sent to Telegram: ${result.sent}`;
        
        // Also send confirmation to the announce channel if configured
        const announceChannel = interaction.guild.channels.cache.get(process.env.ANNOUNCE_CHANNEL);
        if (announceChannel) {
          await announceChannel.send(`🔄 **Catchup completed** by ${interaction.user}\n📊 Processed: ${result.processed} | Sent: ${result.sent}`);
        }
      }

      await interaction.editReply(responseMessage);

    } catch (error) {
      console.error('Error in catchup command:', error);
      await interaction.editReply('❌ Error running catchup process. Check console for details.');
    }
  },
};