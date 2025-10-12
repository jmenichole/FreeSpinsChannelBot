/**
 * FreeSpins Finder Discord Bot - Status Command
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function mask(val) {
  if (!val) return '(unset)';
  const str = String(val);
  if (str.length <= 6) return `${str[0]}*****${str[str.length - 1]}`;
  return `${str.slice(0, 3)}******${str.slice(-3)}`;
}

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatUptime(sec) {
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor((sec / 3600) % 24);
  const d = Math.floor(sec / 86400);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show bot status and key configuration (masked)')
    .addBooleanOption(opt => opt
      .setName('public')
      .setDescription('Show the status publicly (default: no)')
      .setRequired(false)
    ),
  async execute(interaction) {
    const isPublic = interaction.options.getBoolean('public') || false;

    const mem = process.memoryUsage();
    const rss = formatBytes(mem.rss);
    const uptime = formatUptime(process.uptime());
    const pid = process.pid;

    const lockFile = path.join(__dirname, '..', 'logs', 'telegram-polling.lock');
    const hasLock = fs.existsSync(lockFile);
    const lockPid = hasLock ? (fs.readFileSync(lockFile, 'utf8').trim() || '?') : 'none';

    const monitoredId = process.env.MONITORED_CHANNEL_ID || '(unset)';
    const telegramChat = process.env.TELEGRAM_CHAT_ID || '(unset)';

    let channelName = '(unknown)';
    try {
      if (monitoredId && monitoredId !== '(unset)') {
        const ch = await interaction.client.channels.fetch(monitoredId);
        if (ch) channelName = `#${ch.name}`;
      }
    } catch (_) {}

    const lines = [
      `📊 Bot Status`,
      `PID: ${pid} | Uptime: ${uptime} | Memory: ${rss}`,
      `Channel: ${monitoredId} (${channelName})`,
      `Telegram Chat: ${telegramChat}`,
      `Polling lock: ${hasLock ? `present (pid: ${lockPid})` : 'none'}`,
      `Tokens:`,
      `- DISCORD_TOKEN: ${mask(process.env.DISCORD_TOKEN)}`,
      `- TELEGRAM_BOT_TOKEN: ${mask(process.env.TELEGRAM_BOT_TOKEN)}`,
    ];

    await interaction.reply({ content: lines.join('\n'), ephemeral: !isPublic });
  }
};