/**
 * FreeSpins Finder Discord Bot - Link Processing Test
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const { processMessage } = require('./utils/linkProcessor');

// Test the link processing functionality
console.log('🧪 Testing link processing functionality...\n');

// Test case 1: Message with a Stake link with existing referral
const testMessage1 = "Check out this bonus: https://stake.com/casino/games/sweet-bonanza?ref=oldcode&utm_source=test";
console.log('Test 1: Stake link with existing referral');
console.log('Input:', testMessage1);
const result1 = processMessage(testMessage1);
if (result1) {
  console.log('Links found:', result1.links.length);
  result1.links.forEach((link, index) => {
    console.log(`  Link ${index + 1}:`);
    console.log(`    Original: ${link.original}`);
    console.log(`    Processed: ${link.processed}`);
    console.log(`    Modified: ${link.modified}`);
  });
}
console.log('');

// Test case 2: Message with multiple links
const testMessage2 = "Free spins here: https://bc.game/promo/123 and also https://rollbit.com/bonus?partner=someone";
console.log('Test 2: Multiple casino links');
console.log('Input:', testMessage2);
const result2 = processMessage(testMessage2);
if (result2) {
  console.log('Links found:', result2.links.length);
  result2.links.forEach((link, index) => {
    console.log(`  Link ${index + 1}:`);
    console.log(`    Original: ${link.original}`);
    console.log(`    Processed: ${link.processed}`);
    console.log(`    Modified: ${link.modified}`);
  });
}
console.log('');

// Test case 3: Message without links
const testMessage3 = "This is just a regular message without any links!";
console.log('Test 3: Message without links');
console.log('Input:', testMessage3);
const result3 = processMessage(testMessage3);
console.log('Result:', result3 ? 'Links found' : 'No links found');
console.log('');

console.log('✅ Link processing tests completed!');