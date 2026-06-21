#!/usr/bin/env node
/**
 * Pre-write doc warning — warns on creating non-essential .md files
 * stdin: { file_path: string }
 * stdout: { warning: boolean, message?: string }
 */
const path = require('path');

const ALLOWED_DOCS = [
  'README', 'CHANGELOG', 'LICENSE', 'CONTRIBUTING',
  'SOUL', 'RULES', 'AGENTS', 'WORKING-CONTEXT',
  'SECURITY', 'TROUBLESHOOTING', 'SKILL', 'CODE_OF_CONDUCT'
];

const ALLOWED_DIRS = ['commands', 'agents', 'skills', 'rules', '.opencode'];

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const filePath = input.file_path || '';
    const basename = path.basename(filePath);
    
    // Only warn on .md/.txt files
    if (!filePath.match(/\.(md|txt)$/i)) {
      process.stdout.write(JSON.stringify({ warning: false }));
      return;
    }
    
    // Allow known docs
    for (const allowed of ALLOWED_DOCS) {
      if (basename.toUpperCase().startsWith(allowed.toUpperCase())) {
        process.stdout.write(JSON.stringify({ warning: false }));
        return;
      }
    }
    
    // Allow files in known dirs
    for (const dir of ALLOWED_DIRS) {
      if (filePath.includes(dir + '/') || filePath.includes(dir + '\\')) {
        process.stdout.write(JSON.stringify({ warning: false }));
        return;
      }
    }
    
    process.stdout.write(JSON.stringify({
      warning: true,
      message: `Creating ${filePath} — ensure this documentation is necessary`
    }));
  });
}

main();
