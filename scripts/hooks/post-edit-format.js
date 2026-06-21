#!/usr/bin/env node
/**
 * Post-edit formatter — formats file after edit
 * stdin: { file_path: string, project_root: string }
 * stdout: { formatted: boolean }
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, cwd) {
  try { execSync([cmd, ...args].join(' '), { cwd, timeout: 15000, stdio: 'pipe' }); return true; }
  catch { return false; }
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const filePath = input.file_path;
    const root = input.project_root || process.cwd();
    
    if (!filePath || !fs.existsSync(path.join(root, filePath))) {
      process.stdout.write(JSON.stringify({ formatted: false, reason: 'no file' }));
      return;
    }
    
    const ext = path.extname(filePath);
    let formatted = false;
    
    if (/\.(ts|tsx|js|jsx|json|css|html)$/.test(ext)) {
      formatted = run('npx', ['prettier', '--write', filePath], root);
    } else if (ext === '.py') {
      formatted = run('ruff', ['format', filePath], root);
    } else if (ext === '.go') {
      formatted = run('gofmt', ['-w', filePath], root);
    }
    
    process.stdout.write(JSON.stringify({ formatted, file: filePath }));
  });
}

main();
