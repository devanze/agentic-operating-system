#!/usr/bin/env node
/**
 * Permission auto-approve — approves safe read-only/formatter/test operations
 * stdin: { tool: string, command?: string }
 * stdout: { approved: boolean, reason?: string }
 */
const READ_ONLY_TOOLS = ['read', 'glob', 'grep', 'search', 'list', 'webfetch', 'websearch'];

const SAFE_COMMANDS = [
  /^(npx )?(prettier|biome|black|gofmt|rustfmt)/,
  /^(npm test|npx vitest|npx jest|pytest|go test|cargo test|npx eslint)/,
  /^(git status|git diff|git log|git branch)/,
  /^(node|tsx|ts-node)\s+\.opencode\/scripts\//,
];

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const tool = input.tool || '';
    const cmd = input.command || '';
    
    // Read-only tools
    if (READ_ONLY_TOOLS.includes(tool)) {
      process.stdout.write(JSON.stringify({ approved: true, reason: 'read-only tool' }));
      return;
    }
    
    // Safe formatters
    if (tool === 'bash' && SAFE_COMMANDS.some(p => p.test(cmd))) {
      process.stdout.write(JSON.stringify({ approved: true, reason: 'safe command' }));
      return;
    }
    
    process.stdout.write(JSON.stringify({ approved: false }));
  });
}

main();
