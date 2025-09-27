class DiscordLogger {
  constructor(client) {
    this.client = client;
    this.logChannelId = process.env.LOG_CHANNEL;
  }

  async logToChannel(message, type = 'info') {
    if (!this.logChannelId) return;
    
    try {
      const channel = await this.client.channels.fetch(this.logChannelId);
      if (!channel) return;

      const emoji = {
        'info': 'ℹ️',
        'success': '✅', 
        'error': '❌',
        'warning': '⚠️',
        'startup': '🚀',
        'catchup': '🔄'
      };

      const timestamp = new Date().toLocaleString();
      const formattedMessage = `${emoji[type] || 'ℹ️'} **[${timestamp}]** ${message}`;
      
      await channel.send(formattedMessage);
    } catch (error) {
      // Don't log errors about logging to avoid recursion
      console.error('Failed to log to Discord channel:', error.message);
    }
  }

  async logStartup() {
    await this.logToChannel('FreeSpins Bot started and ready!', 'startup');
  }

  async logCatchup(result) {
    if (result.skipped) {
      await this.logToChannel('Catchup already completed for today', 'info');
    } else if (result.processed === 0) {
      await this.logToChannel('No messages to catch up from today', 'info');
    } else {
      await this.logToChannel(`Catchup complete: ${result.processed} processed, ${result.sent} sent to Telegram`, 'catchup');
    }
  }

  async logError(error, context = '') {
    const message = context ? `Error in ${context}: ${error.message}` : `Error: ${error.message}`;
    await this.logToChannel(message, 'error');
  }

  async logLinkProcessing(linkCount, username) {
    await this.logToChannel(`Processed ${linkCount} links from ${username}`, 'success');
  }
}

module.exports = DiscordLogger;