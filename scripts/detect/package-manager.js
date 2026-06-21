#!/usr/bin/env node
/**
 * Auto-detect package manager (npm, yarn, pnpm, bun)
 */
const fs = require('fs');
const path = require('path');

const cwd = process.argv[2] || process.cwd();

function exists(file) { try { return fs.existsSync(path.join(cwd, file)); } catch { return false; } }

if (exists('pnpm-lock.yaml')) console.log('pnpm');
else if (exists('yarn.lock')) console.log('yarn');
else if (exists('bun.lockb')) console.log('bun');
else if (exists('package-lock.json')) console.log('npm');
else if (exists('package.json')) console.log('npm');
else console.log('none');
