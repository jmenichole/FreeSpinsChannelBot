/**
 * FreeSpins Finder Discord Bot - Catchup Functionality Test
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Import utilities
const TelegramBot = require('./utils/telegramBot');
const CatchupProcessor = require('./utils/catchupProcessor');

async function testCatchup() {
  console.log('🧪 Testing Catchup Functionality...\n');

  // Create a minimal client for testing
  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ] 
  });

  try {
    console.log('🔐 Logging into Discord...');
    await client.login(process.env.DISCORD_TOKEN);
    
    console.log('✅ Connected to Discord');
    
    // Initialize components
    const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    const catchupProcessor = new CatchupProcessor(client, telegramBot);
    
    // Test fetching today's messages (without sending)
    console.log('📡 Fetching today\'s messages...');
    const messages = await catchupProcessor.fetchTodayMessages();
    
    console.log(`📊 Results:`);
    console.log(`- Found ${messages.length} messages with links from today`);
    
    if (messages.length > 0) {
      console.log('\n📝 Sample messages found:');
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.author.username}: ${msg.content.substring(0, 100)}...`);
        console.log(`   Sent: ${msg.createdAt.toLocaleString()}`);
      });
      
      if (messages.length > 3) {
        console.log(`   ... and ${messages.length - 3} more`);
      }
    }
    
    console.log('\n✅ Catchup test completed successfully!');
    console.log('💡 To actually process and send these messages, restart the bot or use /catchup command');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.destroy();
    process.exit(0);
  }
}

// Run the test
testCatchup();