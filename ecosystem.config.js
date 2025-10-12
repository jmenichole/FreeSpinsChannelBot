/**
 * FreeSpins Finder Discord Bot - PM2 Ecosystem Configuration
 * 
 * Copyright (c) 2025 jmenichole
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

module.exports = {
  apps: [{
    name: 'freespins-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};