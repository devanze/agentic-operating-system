#!/usr/bin/env node
/**
 * System health check — validates all components at once
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function check(title, fn) {
  try {
    fn();
    console.log(`  ✅ ${title}`);
  } catch (e) {
    console.log(`  ❌ ${title}: ${e.message}`);
  }
}

console.log('OpenCode Agent System — Doctor\n');

check('agents/ directory', () => {
  const files = fs.readdirSync(path.join(ROOT, 'agents')).filter(f => f.endsWith('.md'));
  if (files.length === 0) throw new Error('empty');
  console.log(`    ${files.length} agents`);
});

check('commands/ directory', () => {
  const files = fs.readdirSync(path.join(ROOT, 'commands')).filter(f => f.endsWith('.md'));
  if (files.length === 0) throw new Error('empty');
  console.log(`    ${files.length} commands`);
});

check('skills/ directory', () => {
  const dirs = fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
    .filter(e => e.isDirectory());
  if (dirs.length === 0) throw new Error('empty');
  console.log(`    ${dirs.length} skills`);
});

check('rules/ directory', () => {
  const files = fs.readdirSync(path.join(ROOT, 'rules'), { withFileTypes: true })
    .filter(e => e.isDirectory());
  if (files.length === 0) throw new Error('empty');
  console.log(`    ${files.length} rulesets`);
});

check('opencode.json', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'opencode.json'), 'utf-8'));
  const agents = Object.keys(cfg.agent || {});
  const cmds = Object.keys(cfg.command || {});
  console.log(`    ${agents.length} agents, ${cmds.length} commands defined`);
});

check('plugins/ directory', () => {
  fs.statSync(path.join(ROOT, 'plugins', 'hooks.ts'));
  console.log('    hooks.ts found');
});

check('scripts/ directory', () => {
  fs.statSync(path.join(ROOT, 'scripts', 'instinct.js'));
  fs.statSync(path.join(ROOT, 'scripts', 'validate.js'));
  console.log('    core scripts present');
});

check('MCP servers', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'opencode.json'), 'utf-8'));
  const mcp = cfg.mcp || {};
  const enabled = Object.entries(mcp).filter(([,v]) => v.enabled !== false);
  if (enabled.length === 0) throw new Error('no MCP servers enabled');
  console.log(`    ${enabled.length} enabled / ${Object.keys(mcp).length} total`);
});

console.log('\nDoctor check complete.');
