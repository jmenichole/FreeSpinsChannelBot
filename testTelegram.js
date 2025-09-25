const TelegramBot = require('./utils/telegramBot');
const { processMessage } = require('./utils/linkProcessor');

// Test the Telegram integration (without actually sending messages)
console.log('🧪 Testing Telegram integration...\n');

const telegramBot = new TelegramBot('8035077071:AAG9o-wlKbYn90X_PJyHSReVhVQEEAR3fHw');

// Create a mock Discord message object
const mockDiscordMessage = {
  author: {
    username: 'TestUser'
  },
  channel: {
    name: 'free-spins'
  }
};

// Test message processing and formatting
const testMessage = "Amazing bonus here: https://stake.com/casino/games/sweet-bonanza?ref=oldcode and https://bc.game/promo/123";
console.log('Test message:', testMessage);

const messageData = processMessage(testMessage);
if (messageData) {
  console.log('\n📊 Message processing results:');
  console.log('Links found:', messageData.links.length);
  console.log('Has modified links:', messageData.hasModifiedLinks);
  
  const formattedMessage = telegramBot.formatMessage(messageData, mockDiscordMessage);
  console.log('\n📱 Formatted Telegram message:');
  console.log('---');
  console.log(formattedMessage);
  console.log('---');
  
  console.log('\n✅ Telegram formatting test completed!');
  console.log('💡 To actually send messages, set TELEGRAM_CHAT_ID in your .env file');
} else {
  console.log('❌ No message data processed');
}

// Test bot info retrieval (commented out to avoid API calls in tests)
// telegramBot.getMe().then(info => {
//   console.log('Bot info:', info);
// }).catch(err => {
//   console.error('Error getting bot info:', err.message);
// });