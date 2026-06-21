#!/usr/bin/env node
/**
 * Pre-bash warning — warns on long-running commands
 * stdin: { command: string }
 * stdout: { warning: boolean, message?: string }
 */
const LONG_PATTERNS = [
  /^(npm|pnpm|yarn|bun)\s+install/,
  /^(npm|pnpm|yarn|bun)\s+build/,
  /^(pip|pip3)\s+install/,
  /^cargo\s+(build|install|test)/,
  /^go\s+(build|mod|install)/,
  /^docker\s+(build|compose)/,
];

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const cmd = input.command || '';
    const isLong = LONG_PATTERNS.some(p => p.test(cmd));
    
    process.stdout.write(JSON.stringify(isLong ? {
      warning: true,
      message: `Long-running command: ${cmd.slice(0, 80)}`
    } : { warning: false }));
  });
}

main();
