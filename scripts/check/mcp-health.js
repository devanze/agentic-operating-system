#!/usr/bin/env node
/**
 * MCP health check — verifies MCP servers are reachable
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, 'opencode.json');

function checkMCP() {
  const cfg = JSON.parse(require('fs').readFileSync(CONFIG_PATH, 'utf8'));
  const mcp = cfg.mcp || {};
  const results = [];

  for (const [name, server] of Object.entries(mcp)) {
    const enabled = server.enabled !== false;
    if (!enabled) {
      results.push({ name, status: 'disabled' });
      continue;
    }

    if (server.type === 'local' && server.command) {
      try {
        const cmd = Array.isArray(server.command) ? server.command[0] : server.command.split(' ')[0]
        execSync(`which ${cmd}`, { stdio: 'pipe' });
        results.push({ name, status: 'ok' });
      } catch {
        results.push({ name, status: 'command_not_found', command: server.command });
      }
    } else {
      results.push({ name, status: 'unknown', type: server.type });
    }
  }

  return results;
}

function main() {
  const results = checkMCP();
  const ok = results.filter(r => r.status === 'ok').length;
  const err = results.filter(r => r.status === 'command_not_found').length;
  const disabled = results.filter(r => r.status === 'disabled').length;

  console.log(`MCP Health: ${ok} OK, ${err} errors, ${disabled} disabled\n`);
  for (const r of results) {
    const icon = r.status === 'ok' ? '✅' : r.status === 'disabled' ? '⚫' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}${r.command ? ` (${r.command})` : ''}`);
  }

  process.exit(err > 0 ? 1 : 0);
}

main();
