#!/usr/bin/env node
/**
 * Post-edit console.warn — detects console.log in edited files
 * stdin: { file_path: string, project_root: string }
 * stdout: { console_found: boolean, count?: number }
 */
const { execSync } = require('child_process');
const path = require('path');

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const filePath = input.file_path;
    const root = input.project_root || process.cwd();
    
    if (!filePath || !/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      process.stdout.write(JSON.stringify({ console_found: false }));
      return;
    }
    
    try {
      const out = execSync(`grep -n "console\\.log" ${path.join(root, filePath)} 2>/dev/null`, {
        encoding: 'utf8', timeout: 5000
      });
      const lines = out.trim().split('\n').filter(Boolean);
      process.stdout.write(JSON.stringify({
        console_found: lines.length > 0,
        count: lines.length,
        file: filePath,
        matches: lines.slice(0, 5)
      }));
    } catch {
      process.stdout.write(JSON.stringify({ console_found: false }));
    }
  });
}

main();
