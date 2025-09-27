const affiliateLinks = require('../affiliateLinks.json');
const { replaceReferralCode } = require('./linkProcessor');

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/^www\./, '')
    .replace(/[^a-z0-9.]/g, '');
}

function findAffiliateConfig(input) {
  const norm = normalize(input);
  if (affiliateLinks[input]) return affiliateLinks[input];
  const entries = Object.values(affiliateLinks);
  let found = entries.find(e => normalize(e.domain) === norm);
  if (found) return found;
  found = entries.find(e => normalize(e.domain.split('.')[0]) === norm);
  if (found) return found;
  found = entries.find(e => normalize(e.domain).includes(norm) || normalize(e.domain.split('.')[0]).includes(norm));
  return found || null;
}

function buildReferralResponse({ baseUrl, config, providedUrl }) {
  const hasParam = !!(config && config.referralParam);
  const hasCode = !!(config && config.userReferralCode);

  if (providedUrl) {
    let processed = replaceReferralCode(providedUrl);
    if (!hasParam && hasCode) {
      return { text: `${processed}\n\nUse code: <b>${config.userReferralCode}</b>`, url: processed };
    }
    return { text: processed, url: processed };
  }

  if (!config) {
    return { text: baseUrl, url: baseUrl };
  }

  if (hasParam && hasCode) {
    try {
      const u = new URL(baseUrl);
      u.searchParams.set(config.referralParam, config.userReferralCode);
      return { text: u.toString(), url: u.toString() };
    } catch {
      return { text: baseUrl, url: baseUrl };
    }
  }

  if (hasCode && !hasParam) {
    return { text: `${baseUrl}\n\nUse code: <b>${config.userReferralCode}</b>`, url: baseUrl };
  }

  return { text: baseUrl, url: baseUrl };
}

function parseCommandText(text) {
  // Supports: /ref stake, /referral wow vegas, /ref stake https://...
  const parts = text.trim().split(/\s+/);
  // remove the command itself
  parts.shift();
  if (parts.length === 0) return { casino: null, url: null };

  // If the second token looks like a URL, treat first as casino
  if (parts[1] && /^https?:\/\//i.test(parts[1])) {
    return { casino: parts[0], url: parts[1] };
  }

  // If first token is a URL, only URL is provided
  if (parts[0] && /^https?:\/\//i.test(parts[0])) {
    return { casino: null, url: parts[0] };
  }

  return { casino: parts.join(' '), url: null };
}

async function handleTelegramReferralCommand(telegramBot, chatId, text) {
  const { casino, url } = parseCommandText(text);

  if (!casino && !url) {
    await telegramBot.sendMessage(chatId, 'Usage: /ref <casino|domain> [optional_url]\nExample: /ref wow vegas\nExample: /ref pulsz https://pulsz.com/…');
    return;
  }

  let config = null;
  let baseUrl = null;

  if (casino) {
    config = findAffiliateConfig(casino);
    if (config && config.domain) {
      baseUrl = `https://${config.domain}/`;
    } else if (casino.includes('.')) {
      baseUrl = `https://${casino}/`;
    }
  }

  if (!config && !url && !baseUrl) {
    await telegramBot.sendMessage(chatId, `❌ Could not find a referral configuration for "${casino}". Try using the domain (e.g., wowvegas.com).`);
    return;
  }

  const response = buildReferralResponse({ baseUrl: baseUrl || url || '', config, providedUrl: url });
  await telegramBot.sendMessage(chatId, `🔗 Referral for <b>${casino || 'link'}</b>\n${response.text}`);
}

module.exports = {
  handleTelegramReferralCommand,
};
