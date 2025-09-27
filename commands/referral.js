const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const affiliateLinks = require('../affiliateLinks.json');
const { replaceReferralCode } = require('../utils/linkProcessor');

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/^www\./, '')
    .replace(/[^a-z0-9]/g, '');
}

function findAffiliateConfig(input) {
  const norm = normalize(input);
  // 1) Exact domain key match
  if (affiliateLinks[input]) return affiliateLinks[input];

  // 2) Match by domain field or pattern
  const entries = Object.values(affiliateLinks);
  // Try exact domain
  let found = entries.find(e => normalize(e.domain) === norm);
  if (found) return found;

  // Try by domain without TLD (e.g., "wow vegas" -> wowvegas)
  found = entries.find(e => normalize(e.domain.split('.')[0]) === norm);
  if (found) return found;

  // Try contains (fuzzy)
  found = entries.find(e => normalize(e.domain).includes(norm) || normalize(e.domain.split('.')[0]).includes(norm));
  if (found) return found;

  return null;
}

function buildReferralResponse({ baseUrl, config, providedUrl }) {
  // If referralParam is empty, we can't append it to URL; show code text instead
  const hasParam = !!(config && config.referralParam);
  const hasCode = !!(config && config.userReferralCode);

  if (providedUrl) {
    // User provided a URL; try to transform it
    let processed = replaceReferralCode(providedUrl);
    // If no param possible but we have a code, include hint
    if (!hasParam && hasCode) {
      return { text: `${processed}\n\nUse code: <b>${config.userReferralCode}</b>`, url: processed };
    }
    return { text: processed, url: processed };
  }

  // No URL provided; build from base
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('referral')
    .setDescription('Get the referral link for a specific casino')
    .addStringOption(opt =>
      opt.setName('casino')
        .setDescription('Casino name or domain (e.g., "WOW Vegas" or "wowvegas.com")')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('url')
        .setDescription('Optional: paste a specific URL to convert with referral code')
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName('public')
        .setDescription('Post publicly (default: private reply)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const casinoInput = interaction.options.getString('casino');
    const providedUrl = interaction.options.getString('url') || null;
    const isPublic = interaction.options.getBoolean('public') || false;

    await interaction.deferReply({ ephemeral: !isPublic });

    try {
      const config = findAffiliateConfig(casinoInput);

      // Build base URL
      let baseUrl = null;
      if (providedUrl) {
        baseUrl = providedUrl;
      } else if (config && config.domain) {
        baseUrl = `https://${config.domain}/`;
      } else {
        // Assume input is a domain if it contains a dot; else fallback
        baseUrl = casinoInput.includes('.') ? `https://${casinoInput}/` : null;
      }

      if (!config && !baseUrl) {
        return interaction.editReply({
          content: `❌ Could not find a referral configuration for "${casinoInput}". Try using the domain (e.g., wowvegas.com).`,
        });
      }

      const response = buildReferralResponse({ baseUrl: baseUrl || '', config, providedUrl });

      // Build a link button if we have a URL
      const components = [];
      if (response.url && response.url.startsWith('http')) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(response.url)
            .setLabel('Open Link')
        );
        components.push(row);
      }

      await interaction.editReply({
        content: `🔗 Your referral link for <b>${casinoInput}</b>\n${response.text}`,
        components,
      });
    } catch (err) {
      console.error('Error in /referral:', err);
      await interaction.editReply('❌ Failed to generate referral link.');
    }
  }
};
