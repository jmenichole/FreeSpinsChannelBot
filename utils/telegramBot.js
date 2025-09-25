const axios = require('axios');

class TelegramBot {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  /**
   * Send a message to a Telegram chat
   * @param {string} chatId - The chat ID to send message to
   * @param {string} text - The message text
   * @param {Object} options - Additional options
   * @returns {Promise} API response
   */
  async sendMessage(chatId, text, options = {}) {
    try {
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: options.parse_mode || 'HTML',
        disable_web_page_preview: options.disable_web_page_preview || false,
        disable_notification: options.disable_notification || false,
        ...options
      };

      const response = await axios.post(`${this.baseUrl}/sendMessage`, payload);
      return response.data;
    } catch (error) {
      console.error('Error sending Telegram message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get bot information
   * @returns {Promise} Bot information
   */
  async getMe() {
    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      return response.data;
    } catch (error) {
      console.error('Error getting bot info:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Format message for Discord to Telegram forwarding
   * @param {Object} messageData - Processed message data
   * @param {Object} discordMessage - Discord message object
   * @returns {string} Formatted message
   */
  formatMessage(messageData, discordMessage) {
    let message = `🔗 <b>New links from Discord</b>\n\n`;
    
    if (discordMessage.author) {
      message += `👤 <b>From:</b> ${discordMessage.author.username}\n`;
    }
    
    if (discordMessage.channel) {
      message += `📢 <b>Channel:</b> ${discordMessage.channel.name}\n`;
    }
    
    message += `\n`;
    
    messageData.links.forEach((linkData, index) => {
      message += `🎰 <b>Link ${index + 1}:</b>\n`;
      message += `${linkData.processed}\n`;
      
      if (linkData.modified) {
        message += `✅ <i>Referral code updated</i>\n`;
      }
      
      message += `\n`;
    });
    
    // Add original message content if it has text beyond links
    const messageWithoutLinks = messageData.originalMessage;
    const textContent = messageData.links.reduce((text, link) => {
      return text.replace(link.original, '').trim();
    }, messageWithoutLinks).trim();
    
    if (textContent) {
      message += `💬 <b>Original message:</b>\n${textContent}`;
    }
    
    return message;
  }
}

module.exports = TelegramBot;