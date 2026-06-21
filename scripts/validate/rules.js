#!/usr/bin/env node
/**
 * Validate rule markdown files in .opencode/rules/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const RULES_DIR = path.join(ROOT, 'rules');

function collectRules(dir, base) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectRules(abs, base));
    } else if (entry.name.endsWith('.md')) {
      files.push(path.relative(base, abs));
    }
  }
  return files;
}

function main() {
  if (!fs.existsSync(RULES_DIR)) {
    console.log('No rules directory found');
    process.exit(0);
  }

  const files = collectRules(RULES_DIR, RULES_DIR);
  let errors = 0;

  for (const file of files) {
    const fp = path.join(RULES_DIR, file);
    const content = fs.readFileSync(fp, 'utf-8');
    if (content.trim().length === 0) {
      console.error(`ERROR: ${file} - Empty`);
      errors++;
    }
  }

  console.log(`Validated ${files.length} rule files (${errors} errors)`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
