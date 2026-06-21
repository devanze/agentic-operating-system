#!/usr/bin/env node
/**
 * Cost tracker — estimates token cost per session
 * Uses rough token counting on agent interactions
 */
const fs = require('fs');
const path = require('path');

const RATES = {
  'deepseek-v4-pro': { input: 1.00, output: 4.00 }, // per 1M tokens
  'deepseek-v4-flash': { input: 0.25, output: 1.00 },
};

const LOG_FILE = process.argv[2] || null;

function countTokens(text) {
  return Math.ceil((text || '').length / 3.5);
}

function estimateCost(model, inputTokens, outputTokens) {
  const rate = RATES[model] || RATES['deepseek-v4-flash'];
  return ((inputTokens * rate.input) + (outputTokens * rate.output)) / 1_000_000;
}

function costReport(logPath) {
  if (!logPath || !fs.existsSync(logPath)) {
    return { sessions: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
  }

  const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  let totalInput = 0;
  let totalOutput = 0;
  let totalCost = 0;
  const sessions = new Set();

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      sessions.add(entry.session_id || 'unknown');
      totalInput += entry.input_tokens || 0;
      totalOutput += entry.output_tokens || 0;
      totalCost += entry.cost || 0;
    } catch { /* skip invalid lines */ }
  }

  return { sessions: sessions.size, totalInputTokens: totalInput, totalOutputTokens: totalOutput, totalCost };
}

function main() {
  if (LOG_FILE) {
    const report = costReport(LOG_FILE);
    console.log(JSON.stringify({
      ...report,
      summary: `${report.sessions} sessions | ${(report.totalInputTokens / 1000).toFixed(1)}K input + ${(report.totalOutputTokens / 1000).toFixed(1)}K output | $${report.totalCost.toFixed(4)} total`
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      rates: RATES,
      usage: 'node cost-tracker.js <log-file.jsonl>'
    }, null, 2));
  }
}

main();
