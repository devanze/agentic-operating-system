#!/usr/bin/env node
/**
 * Session idle console audit — scans edited files for console.log
 * stdin: { files: string[], project_root: string }
 * stdout: { total_count: number, files: string[] }
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
    
    const files = input.files || [];
    const root = input.project_root || process.cwd();
    const consoleFiles = [];
    let total = 0;
    
    for (const file of files) {
      if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
      try {
        const out = execSync(`grep -c "console\\.log" ${path.join(root, file)} 2>/dev/null`, {
          encoding: 'utf8', timeout: 5000
        });
        const count = parseInt(out.trim(), 10);
        if (count > 0) { total += count; consoleFiles.push(file); }
      } catch { /* no matches */ }
    }
    
    process.stdout.write(JSON.stringify({
      total_count: total,
      file_count: consoleFiles.length,
      files: consoleFiles,
      clean: total === 0
    }));
  });
}

main();
