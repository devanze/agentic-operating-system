#!/usr/bin/env node
/**
 * Quality gate — lightweight checks before commit
 * Auto-detects formatter/linter and runs on changed files
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function which(cmd) {
  try { execSync(`which ${cmd}`, { stdio: 'pipe' }); return true; } catch { return false; }
}

function fileExists(p) { try { return fs.existsSync(p); } catch { return false; } }

function detectPackageManager(projectRoot) {
  if (fileExists(path.join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fileExists(path.join(projectRoot, 'yarn.lock'))) return 'yarn';
  if (fileExists(path.join(projectRoot, 'bun.lockb'))) return 'bun';
  if (fileExists(path.join(projectRoot, 'package-lock.json'))) return 'npm';
  return 'npm';
}

function detectFormatter(projectRoot) {
  if (fileExists(path.join(projectRoot, 'biome.json'))) return 'biome';
  if (fileExists(path.join(projectRoot, '.prettierrc'))) return 'prettier';
  if (fileExists(path.join(projectRoot, 'prettier.config.js'))) return 'prettier';
  return null;
}

function detectLinter(projectRoot) {
  if (fileExists(path.join(projectRoot, 'biome.json'))) return 'biome';
  if (fileExists(path.join(projectRoot, '.eslintrc.js'))) return 'eslint';
  if (fileExists(path.join(projectRoot, '.eslintrc.cjs'))) return 'eslint';
  if (fileExists(path.join(projectRoot, '.eslintrc.json'))) return 'eslint';
  if (fileExists(path.join(projectRoot, 'eslint.config.js'))) return 'eslint';
  if (fileExists(path.join(projectRoot, 'eslint.config.mjs'))) return 'eslint';
  return null;
}

function run(cmd, args) {
  try {
    return execSync([cmd, ...args].join(' '), {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 30000
    });
  } catch (e) {
    return e.stdout || e.stderr || '';
  }
}

function main() {
  const projectRoot = process.cwd();
  const ext = process.argv[2]; // optional: specific file

  let issues = 0;

  const pm = detectPackageManager(projectRoot);
  const formatter = detectFormatter(projectRoot);
  const linter = detectLinter(projectRoot);

  console.log(`Quality Gate — ${path.basename(projectRoot)}`);
  console.log(`  Package manager: ${pm}`);
  console.log(`  Formatter: ${formatter || 'none'}`);
  console.log(`  Linter: ${linter || 'none'}\n`);

  // Format check
  if (formatter === 'biome') {
    console.log('[format] biome check...');
    const out = run('npx', ['biome', 'check', ext || '--no-errors-on-unmatched', '.']);
    if (out.includes('✖')) issues++;
    console.log(out.slice(0, 200));
  } else if (formatter === 'prettier') {
    console.log('[format] prettier --check...');
    const out = run('npx', ['prettier', '--check', ext || '.']);
    console.log(out.slice(0, 200));
  }

  // Lint check
  if (linter === 'biome') {
    console.log('[lint] biome lint...');
    const out = run('npx', ['biome', 'lint', ext || '.']);
    const errors = (out.match(/✖/g) || []).length;
    if (errors > 0) issues++;
    console.log(`  ${errors} issues found`);
  } else if (linter === 'eslint') {
    console.log('[lint] eslint...');
    const out = run('npx', ['eslint', ext || '.']);
    console.log(out.slice(0, 200));
  }

  // Type check
  if (fileExists(path.join(projectRoot, 'tsconfig.json'))) {
    console.log('[typecheck] tsc --noEmit...');
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8', cwd: projectRoot, timeout: 60000 });
      console.log('  ✅ no type errors');
    } catch (e) {
      issues++;
      console.log('  ❌ type errors found');
    }
  }

  console.log(`\nQuality gate: ${issues === 0 ? 'PASS' : 'FAIL'} (${issues} issues)`);
  process.exit(issues > 0 ? 1 : 0);
}

main();
