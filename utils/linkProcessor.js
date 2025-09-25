const affiliateLinks = require('../affiliateLinks.json');

/**
 * Extract links from a Discord message
 * @param {string} messageContent - The Discord message content
 * @returns {string[]} Array of URLs found in the message
 */
function extractLinks(messageContent) {
  // Regular expression to match URLs
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const matches = messageContent.match(urlRegex);
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
      // Remove existing referral parameters
      const referralParams = ['ref', 'referral', 'affiliate', 'aff', 'code', 'partner', 'r'];
      referralParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // Add user's referral code
      if (affiliateConfig.userReferralCode && affiliateConfig.userReferralCode !== 'your_' + affiliateConfig.domain.split('.')[0] + '_ref_code') {
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
 * @param {string} messageContent - The Discord message content
 * @returns {Object} Processed message data
 */
function processMessage(messageContent) {
  const originalLinks = extractLinks(messageContent);
  
  if (originalLinks.length === 0) {
    return null;
  }
  
  const processedLinks = originalLinks.map(link => ({
    original: link,
    processed: replaceReferralCode(link),
    modified: replaceReferralCode(link) !== link
  }));
  
  return {
    originalMessage: messageContent,
    links: processedLinks,
    hasLinks: processedLinks.length > 0,
    hasModifiedLinks: processedLinks.some(link => link.modified)
  };
}

module.exports = {
  extractLinks,
  replaceReferralCode,
  processMessage
};