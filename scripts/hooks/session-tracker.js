#!/usr/bin/env node
/**
 * Session activity tracker — logs tool usage for metrics
 * PostToolUse hook adapter
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.opencode', 'metrics');
const LOG_FILE = 'tool-usage.jsonl';

function redactSecrets(text) {
  return String(text || '')
    .replace(/--token[= ][^ ]*/g, '--token=<REDACTED>')
    .replace(/password[= ][^ ]*/gi, 'password=<REDACTED>')
    .replace(/\bsk-[a-zA-Z0-9_]+\b/g, '<REDACTED>')
    .replace(/\bgh[pous]_[A-Za-z0-9_]+\b/g, '<REDACTED>');
}

function summarize(text, maxLen = 200) {
  const s = redactSecrets(String(text || '')).trim().replace(/\s+/g, ' ');
  return s.length <= maxLen ? s : s.slice(0, maxLen - 3) + '...';
}

function track(input) {
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const row = {
    timestamp: new Date().toISOString(),
    session_id: process.env.OPENCODE_SESSION_ID || 'unknown',
    tool_name: input?.tool_name || 'unknown',
    input_summary: summarize(input?.tool_input?.command || JSON.stringify(input?.tool_input || {})),
    file_path: input?.tool_input?.file_path || null,
  };

  fs.appendFileSync(path.join(LOG_DIR, LOG_FILE), JSON.stringify(row) + '\n');
  return row;
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
    process.stdin.on('end', () => {
    try {
      const input = raw.trim() ? JSON.parse(raw) : {};
      const row = track(input);
      console.log(JSON.stringify(row));
    } catch (e) {
      console.error(`Tracker error: ${e.message}`);
    }
  });
}

if (require.main === module) main();

module.exports = { track };
