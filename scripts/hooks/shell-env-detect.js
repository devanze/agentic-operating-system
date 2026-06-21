#!/usr/bin/env node
/**
 * Shell environment detector — detects package manager + languages
 * stdin: { project_root: string }
 * stdout: { env: Record<string, string> }
 */
const fs = require('fs');
const path = require('path');

const LOCKFILES = {
  'bun.lockb': 'bun',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
};

const LANG_DETECT = {
  'tsconfig.json': 'typescript',
  'go.mod': 'go',
  'pyproject.toml': 'python',
  'requirements.txt': 'python',
  'Cargo.toml': 'rust',
  'Package.swift': 'swift',
  'composer.json': 'php',
  'Gemfile': 'ruby',
};

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }
    
    const root = input.project_root || process.cwd();
    const env = { AGENT_SYSTEM_VERSION: '1.0.0' };
    
    // Detect package manager
    for (const [lockfile, pm] of Object.entries(LOCKFILES)) {
      if (fs.existsSync(path.join(root, lockfile))) {
        env.PACKAGE_MANAGER = pm;
        break;
      }
    }
    if (!env.PACKAGE_MANAGER && fs.existsSync(path.join(root, 'package.json'))) {
      env.PACKAGE_MANAGER = 'npm';
    }
    
    // Detect languages
    const langs = [];
    for (const [file, lang] of Object.entries(LANG_DETECT)) {
      if (fs.existsSync(path.join(root, file)) && !langs.includes(lang)) {
        langs.push(lang);
      }
    }
    if (langs.length > 0) {
      env.DETECTED_LANGUAGES = langs.join(',');
      env.PRIMARY_LANGUAGE = langs[0];
    }
    
    process.stdout.write(JSON.stringify({ env }));
  });
}

main();
