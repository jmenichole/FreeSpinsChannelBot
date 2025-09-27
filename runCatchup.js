const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Import utilities
const TelegramBot = require('./utils/telegramBot');
const CatchupProcessor = require('./utils/catchup');

async function runCatchup() {
  console.log('🔄 Running manual catchup process...\n');

  // Create a client
  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ] 
  });

  try {
    console.log('🔐 Connecting to Discord...');
    await client.login(process.env.DISCORD_TOKEN);
    
    console.log('✅ Connected to Discord');
    
    // Initialize components
    const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    const catchupProcessor = new CatchupProcessor(client, telegramBot);
    
    // Run catchup process
    console.log('🚀 Starting catchup process...');
    const result = await catchupProcessor.processTodayMessages();
    
    console.log('\n📊 Catchup Results:');
    console.log(`- Messages processed: ${result.processed}`);
    console.log(`- Messages sent to Telegram: ${result.sent}`);
    
    if (result.processed === 0) {
      console.log('ℹ️  No messages with links found from today');
    } else {
      console.log('✅ Catchup completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Catchup failed:', error);
    process.exit(1);
  } finally {
    client.destroy();
    process.exit(0);
  }
}

// Run catchup
runCatchup();