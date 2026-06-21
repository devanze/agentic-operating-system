#!/usr/bin/env node
/**
 * Post-edit TypeScript typecheck — runs tsc --noEmit after TS edits
 * stdin: { project_root: string }
 * stdout: { typecheck_passed: boolean, errors?: string[] }
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const root = input.project_root || process.cwd();
    const tsconfig = path.join(root, 'tsconfig.json');
    
    if (!fs.existsSync(tsconfig)) {
      process.stdout.write(JSON.stringify({ typecheck_passed: true, reason: 'no tsconfig' }));
      return;
    }
    
    try {
      execSync('npx tsc --noEmit', { cwd: root, encoding: 'utf8', timeout: 60000 });
      process.stdout.write(JSON.stringify({ typecheck_passed: true }));
    } catch (e) {
      const errors = (e.stdout || '').split('\n').filter(Boolean).slice(0, 10);
      process.stdout.write(JSON.stringify({
        typecheck_passed: false,
        errors,
        count: errors.length
      }));
    }
  });
}

main();
