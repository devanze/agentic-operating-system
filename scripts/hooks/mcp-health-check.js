#!/usr/bin/env node
/**
 * MCP Health Auto-Check (session start)
 *
 * stdin: { project_root: string }
 * stdout: { ok: boolean, total: number, enabled: number, healthy: number, unhealthy: number, servers: [...] }
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkMCP(projectRoot) {
  let configPath = path.join(projectRoot, 'opencode.json');
  if (!fs.existsSync(configPath)) configPath = path.join(projectRoot, '.opencode', 'opencode.json');
  if (!fs.existsSync(configPath)) {
    return { ok: true, total: 0, enabled: 0, healthy: 0, unhealthy: 0, servers: [] };
  }

  let cfg;
  try { cfg = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { return { ok: true, total: 0, enabled: 0, healthy: 0, unhealthy: 0, servers: [] }; }

  const mcp = cfg.mcp || {};
  const servers = [];

  for (const [name, server] of Object.entries(mcp)) {
    const enabled = server.enabled !== false;
    if (!enabled) {
      servers.push({ name, status: 'disabled' });
      continue;
    }

    if ((server.type === 'local' || !server.type) && server.command) {
      const cmdStr = typeof server.command === 'string' ? server.command : Array.isArray(server.command) ? server.command.join(' ') : '';
      const parts = cmdStr.split(/\s+/);
      const bin = parts[0] === 'npx' && parts.length > 1 ? 'npx' : parts[0];
      try {
        execSync(`command -v "${bin}"`, { stdio: 'pipe', timeout: 3000 });
        servers.push({ name, status: 'healthy', bin });
      } catch {
        servers.push({ name, status: 'binary_missing', bin });
      }
    } else if (server.type === 'sse' || server.type === 'streamableHttp') {
      servers.push({ name, status: 'untested', type: server.type, url: server.url || '' });
    } else {
      servers.push({ name, status: 'untested', type: server.type || 'unknown' });
    }
  }

  const healthy = servers.filter(s => s.status === 'healthy').length;
  const unhealthy = servers.filter(s => s.status === 'binary_missing').length;
  const enabled = servers.filter(s => s.status !== 'disabled').length;

  return {
    ok: unhealthy === 0,
    total: servers.length,
    enabled,
    healthy,
    unhealthy,
    servers
  };
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }

    const result = checkMCP(input.project_root || process.cwd());
    process.stdout.write(JSON.stringify(result));
  });
}

main();
