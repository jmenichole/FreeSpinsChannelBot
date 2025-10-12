/**
 * FreeSpins Finder Discord Bot - Catchup Processor Utility
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const { processMessage } = require('./linkProcessor');
const TelegramBot = require('./telegramBot');

class CatchupProcessor {
  constructor(client, telegramBot) {
    this.client = client;
    this.telegramBot = telegramBot;
    this.monitoredChannelId = process.env.MONITORED_CHANNEL_ID;
  }

  /**
   * Get the start of today in UTC
   */
  getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Fetch messages from today that were sent before bot startup
   */
  async fetchTodayMessages() {
    if (!this.monitoredChannelId) {
      console.log('❌ No monitored channel ID configured');
      return [];
    }

    try {
      const channel = await this.client.channels.fetch(this.monitoredChannelId);
      if (!channel) {
        console.log('❌ Could not find monitored channel');
        return [];
      }

      console.log(`🔍 Fetching messages from #${channel.name}...`);
      
      const todayStart = this.getTodayStart();
      const messages = [];
      let lastMessageId;
      let fetchedCount = 0;

      // Fetch messages in batches (Discord API limit is 100 per request)
      while (true) {
        const options = { limit: 100 };
        if (lastMessageId) {
          options.before = lastMessageId;
        }

        const batch = await channel.messages.fetch(options);
        if (batch.size === 0) break;

        let foundOlderMessage = false;
        
        for (const message of batch.values()) {
          // Stop if we've gone past today
          if (message.createdAt < todayStart) {
            foundOlderMessage = true;
            break;
          }

          // Only process messages from today that contain links (content or embeds)
          if (this.containsLinks(message)) {
            messages.push({
              id: message.id,
              content: message.content,
              embeds: message.embeds,
              author: message.author,
              createdAt: message.createdAt,
              channelName: channel.name,
              fullMessage: message // Keep reference to full message
            });
          }

          fetchedCount++;
        }

        if (foundOlderMessage) break;

        // Set up for next batch
        lastMessageId = batch.last()?.id;
        
        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Fetched ${fetchedCount} messages, found ${messages.length} with links from today`);
      return messages.reverse(); // Return in chronological order

    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Check if message contains any links (in content or embeds)
   */
  containsLinks(message) {
    const { extractLinks } = require('./linkProcessor');
    const links = extractLinks(message);
    return links.length > 0;
  }

  /**
   * Process all messages from today and send to Telegram
   */
  async processTodayMessages() {
    console.log('🚀 Starting catchup process for today\'s messages...');
    
    const messages = await this.fetchTodayMessages();
    
    if (messages.length === 0) {
      console.log('ℹ️  No messages with links found from today');
      return { processed: 0, sent: 0 };
    }

    let processedCount = 0;
    let sentCount = 0;

    console.log(`📝 Processing ${messages.length} messages...`);

    for (const message of messages) {
      try {
        // Process the full message (content + embeds) for link replacement
        const result = await processMessage(message.fullMessage || message);
        
        if (result && (result.hasModifiedLinks || result.links.length > 0)) {
          // Create formatted message for Telegram using the same minimal formatter as real-time
          const telegramMessage = this.telegramBot.formatMessage(result, message.fullMessage || message);
          
          // Send to Telegram
          const telegramChatId = process.env.TELEGRAM_CHAT_ID;
          const sent = await this.telegramBot.sendMessage(telegramChatId, telegramMessage);
          
          if (sent) {
            sentCount++;
            console.log(`✅ Sent message from ${message.author.username} (${message.createdAt.toLocaleString()})`);
            try {
              const sentStore = require('./sentStore');
              sentStore.add(message.id);
            } catch {}
          }

          processedCount++;
          
          // Add delay between sends to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Error processing message ${message.id}:`, error);
      }
    }

    console.log(`🎉 Catchup complete! Processed: ${processedCount}, Sent: ${sentCount}`);
    return { processed: processedCount, sent: sentCount };
  }

  // Legacy formatter removed in favor of telegramBot.formatMessage

  /**
   * Extract bonus information from message text
   */
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

  /**
   * Extract domain name from URL for cleaner display
   */
  getDomainName(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      // Capitalize first letter
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch (e) {
      return 'Link';
    }
  }

  /**
   * Clean up original message text
   */
  cleanOriginalMessage(originalMessage, links) {
    let cleanText = originalMessage || '';
    
    // Remove all links from the text
    if (links) {
      links.forEach(link => {
        cleanText = cleanText.replace(link.original, '').trim();
      });
    }
    
    // Clean up common patterns
    cleanText = cleanText
      .replace(/@All Freebies/g, '') // Remove mentions
      .replace(/@\w+ Freebies/g, '')
      .replace(/\*\*\[.*?\]\(.*?\)\*\*/g, '') // Remove markdown links
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove simple markdown links
      .replace(/sweepscoinguide\.com/g, '') // Remove site mentions
      .replace(/Submitted by \w+/g, '') // Remove attribution
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Limit length and add ellipsis if too long
    if (cleanText.length > 100) {
      cleanText = cleanText.substring(0, 97) + '...';
    }
    
    return cleanText;
  }

  /**
   * Run catchup process only once (creates a flag file)
   */
  async runOnceCatchup() {
    const fs = require('fs');
    const path = require('path');
    
    const flagFile = path.join(__dirname, '..', 'logs', 'catchup-completed.flag');
    
    // Check if catchup already completed today
    if (fs.existsSync(flagFile)) {
      const stats = fs.statSync(flagFile);
      const flagDate = new Date(stats.mtime);
      const today = this.getTodayStart();
      
      if (flagDate >= today) {
        console.log('ℹ️  Catchup already completed for today');
        return { processed: 0, sent: 0, skipped: true };
      }
    }

    // Run catchup
    const result = await this.processTodayMessages();
    
    // Create flag file to prevent running again today
    fs.writeFileSync(flagFile, `Catchup completed at ${new Date().toISOString()}\nProcessed: ${result.processed}\nSent: ${result.sent}`);
    
    return result;
  }
}

module.exports = CatchupProcessor;