const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
let sentSet = new Set();
let filePath = null;

function getDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getFilePath() {
  const dateKey = getDateKey();
  return path.join(logsDir, `sent-${dateKey}.json`);
}

function ensureDir() {
  try { fs.mkdirSync(logsDir, { recursive: true }); } catch {}
}

function load() {
  ensureDir();
  filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      sentSet = new Set(Array.isArray(data) ? data.map(String) : []);
    } else {
      sentSet = new Set();
    }
  } catch (e) {
    console.warn('sentStore: failed to load, starting fresh:', e.message);
    sentSet = new Set();
  }
}

function persist() {
  try {
    ensureDir();
    if (!filePath) filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(Array.from(sentSet)), 'utf8');
  } catch (e) {
    console.warn('sentStore: failed to persist:', e.message);
  }
}

function has(id) {
  return sentSet.has(String(id));
}

function add(id) {
  sentSet.add(String(id));
  persist();
}

module.exports = { load, has, add };
