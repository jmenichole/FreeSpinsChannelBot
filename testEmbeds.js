/**
 * FreeSpins Finder Discord Bot - Embed Processing Test
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const { processMessage, extractTextFromEmbeds } = require('./utils/linkProcessor');

// Test embed processing
console.log('🧪 Testing Embed Processing...\n');

// Simulate a Discord message object with embeds (like in the screenshot)
const mockMessage = {
  content: '',
  embeds: [
    {
      title: 'Spintember Spins at WOW Vegas',
      description: 'Flaming Chillies',
      url: 'https://www.wowvegas.com/promo/spintember?ref=oldcode',
      fields: [
        {
          name: 'Bonus Info',
          value: 'Check out this link: https://www.pulsz.com/casino/games/sweet-bonanza?invited_by=olduser'
        }
      ],
      footer: {
        text: 'More at https://stake.us/casino'
      }
    },
    {
      title: 'Free Spins on Blazing777 at Real Prize',
      description: 'Amazing bonus here',
      url: 'https://www.realprize.com/bonus?refer=someone'
    }
  ],
  author: {
    username: 'TestUser'
  }
};

console.log('📋 Mock message structure:');
console.log('- Content:', mockMessage.content || '(empty)');
console.log('- Embeds:', mockMessage.embeds.length);

console.log('\n🔍 Testing embed text extraction...');
const extractedText = extractTextFromEmbeds(mockMessage);
console.log('Extracted text:', extractedText);

console.log('\n🔗 Testing link processing...');
const result = processMessage(mockMessage);

if (result) {
  console.log('✅ Processing successful!');
  console.log(`📊 Found ${result.links.length} links:`);
  
  result.links.forEach((link, index) => {
    console.log(`\n🎰 Link ${index + 1}:`);
    console.log(`  Original: ${link.original}`);
    console.log(`  Processed: ${link.processed}`);
    console.log(`  Modified: ${link.modified ? '✅ Yes' : '❌ No'}`);
  });
  
  console.log('\n💬 Cleaned message:', result.cleanedMessage);
} else {
  console.log('❌ No links found in embeds');
}

console.log('\n✅ Embed processing test completed!');