const affiliateLinks = require('../affiliateLinks.json');

/**
 * Extract text content from Discord message embeds
 * @param {Object} message - Discord message object
 * @returns {string} Combined text from embeds
 */
function extractTextFromEmbeds(message) {
  if (!message.embeds || message.embeds.length === 0) return '';
  
  let combinedText = '';
  
  message.embeds.forEach(embed => {
    if (embed.title) combinedText += embed.title + ' ';
    if (embed.description) combinedText += embed.description + ' ';
    if (embed.url) combinedText += embed.url + ' ';
    
    // Check fields for links
    if (embed.fields) {
      embed.fields.forEach(field => {
        if (field.name) combinedText += field.name + ' ';
        if (field.value) combinedText += field.value + ' ';
      });
    }
    
    // Check footer
    if (embed.footer && embed.footer.text) combinedText += embed.footer.text + ' ';
    
    // Check author
    if (embed.author && embed.author.name) combinedText += embed.author.name + ' ';
  });
  
  return combinedText.trim();
}

/**
 * Extract links from a Discord message (content + embeds)
 * @param {Object} message - Discord message object or string content
 * @returns {string[]} Array of URLs found in the message
 */
function extractLinks(message) {
  let textToSearch = '';
  
  // Handle both string content and message objects
  if (typeof message === 'string') {
    textToSearch = message;
  } else {
    // Combine regular message content with embed content
    textToSearch = (message.content || '') + ' ' + extractTextFromEmbeds(message);
  }
  
  // Regular expression to match URLs
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const matches = textToSearch.match(urlRegex);
  return matches || [];
}

/**
 * Replace referral codes in a URL with user's referral code
 * @param {string} url - The original URL
 * @returns {string} URL with replaced referral code
 */
function replaceReferralCode(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase().replace('www.', '');
    
    // Find matching affiliate configuration
    const affiliateConfig = Object.values(affiliateLinks).find(config => {
      return config.patterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(domain);
      });
    });
    
    if (affiliateConfig) {
      // Remove existing referral parameters (common + domain-specific)
      const referralParams = ['ref', 'referral', 'affiliate', 'aff', 'code', 'partner', 'r'];
      if (affiliateConfig.referralParam && !referralParams.includes(affiliateConfig.referralParam)) {
        referralParams.push(affiliateConfig.referralParam);
      }
      referralParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // Add user's referral code (only if referralParam is defined)
      const hasParam = typeof affiliateConfig.referralParam === 'string' && affiliateConfig.referralParam.length > 0;
      if (
        hasParam &&
        affiliateConfig.userReferralCode &&
        affiliateConfig.userReferralCode !== 'your_' + affiliateConfig.domain.split('.')[0] + '_ref_code'
      ) {
        urlObj.searchParams.set(affiliateConfig.referralParam, affiliateConfig.userReferralCode);
      }
      
      return urlObj.toString();
    }
    
    return url;
  } catch (error) {
    console.error('Error processing URL:', error);
    return url;
  }
}

/**
 * Process a Discord message and extract/modify links
 * @param {string|Object} messageInput - The Discord message content string or message object
 * @returns {Object} Processed message data
 */
function processMessage(messageInput) {
  const originalLinks = extractLinks(messageInput);
  
  if (originalLinks.length === 0) {
    return null;
  }
  
  const processedLinks = originalLinks.map(link => ({
    original: link,
    processed: replaceReferralCode(link),
    modified: replaceReferralCode(link) !== link
  }));
  
  // Get clean text for display
  let displayText = '';
  if (typeof messageInput === 'string') {
    displayText = messageInput;
  } else {
    displayText = (messageInput.content || '') + ' ' + extractTextFromEmbeds(messageInput);
  }
  
  // Remove the original links from display text for cleaner output
  let cleanedMessage = displayText;
  originalLinks.forEach(link => {
    cleanedMessage = cleanedMessage.replace(link, '').trim();
  });
  
  return {
    originalMessage: displayText,
    cleanedMessage: cleanedMessage,
    links: processedLinks,
    hasLinks: processedLinks.length > 0,
    hasModifiedLinks: processedLinks.some(link => link.modified)
  };
}

module.exports = {
  extractLinks,
  extractTextFromEmbeds,
  replaceReferralCode,
  processMessage
};