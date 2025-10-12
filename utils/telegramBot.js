/**
 * FreeSpins Finder Discord Bot - Telegram Bot Utility
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const axios = require('axios');

class TelegramBot {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

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
   * Long-poll Telegram for updates (getUpdates)
   * @param {number} offset - Update ID offset
   * @param {number} timeout - Long poll timeout in seconds
   */
  async getUpdates(offset = 0, timeout = 25) {
    try {
      const response = await axios.get(`${this.baseUrl}/getUpdates`, {
        params: { offset, timeout }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Telegram updates:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Set bot commands for Telegram UI hints
   */
  async setMyCommands(commands) {
    try {
      const response = await axios.post(`${this.baseUrl}/setMyCommands`, {
        commands
      });
      return response.data;
    } catch (error) {
      console.error('Error setting Telegram commands:', error.response?.data || error.message);
      throw error;
    }
  }

  formatMessage(messageData, discordMessage) {
    let message = '';

    const bonusInfo = this.extractBonusInfo(messageData.originalMessage);

    if (bonusInfo) {
      message += `🎰 <b>${bonusInfo}</b>\n\n`;
    }

    messageData.links.forEach((linkData, index) => {
      const url = linkData.processed || linkData.original;
      const casinoName = this.getCasinoNameFromUrl(url);
      message += `🏷️ <b>${casinoName}</b>\n`;
      message += `🔗 ${url}\n`;
      if (linkData.modified) {
        message += `✅ <i>Referral applied</i>\n`;
      }
      if (index < messageData.links.length - 1) {
        message += `\n`;
      }
    });

    return message;
  }

  getCasinoNameFromUrl(url) {
    try {
      const { hostname } = new URL(url);
      const host = hostname.replace(/^www\./i, '');
      const parts = host.split('.');
      const commonSubs = ['www', 'app', 'click', 'go', 'm'];
      let label = parts[0];
      if (parts.length >= 3 && commonSubs.includes(parts[0])) {
        label = parts[1];
      }
      const name = label
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      return name || 'Casino';
    } catch (e) {
      return 'Casino';
    }
  }

  extractBonusInfo(originalMessage) {
    if (!originalMessage) return null;
    
    let text = originalMessage
      .replace(/@All Freebies/g, '')
      .replace(/@\w+ Freebies/g, '')
      .replace(/\*\*\[.*?\]\(.*?\)\*\*/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/sweepscoinguide\.com/g, '')
      .replace(/Submitted by \w+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Look for bonus pattern first
    const bonusMatch = text.match(/(\d+\s*(?:SC|Free Spins?|Bonus|Coins?)[^.]*?(?:at\s+[A-Za-z\s]+)?)/i);
    if (bonusMatch) {
      return bonusMatch[1].trim();
    }
    
    // Look for casino name pattern
    const casinoMatch = text.match(/(?:at\s+)?([A-Za-z\s]+?)(?:\s|$)/i);
    if (casinoMatch && casinoMatch[1]) {
      const casino = casinoMatch[1].trim();
      if (casino && casino !== 'Free' && casino !== 'SC' && casino.length > 2) {
        return casino;
      }
    }
    
    // Fallback - clean text up to 40 chars
    if (text && text.length > 0) {
      let result = text.substring(0, 40).trim();
      if (text.length > 40) result += '...';
      return result;
    }
    
    return null;
  }
}

module.exports = TelegramBot;
