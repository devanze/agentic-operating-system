#!/usr/bin/env node
/**
 * Validate command markdown files in .opencode/commands/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const COMMANDS_DIR = path.join(ROOT, 'commands');

function main() {
  if (!fs.existsSync(COMMANDS_DIR)) {
    console.log('No commands directory found');
    process.exit(0);
  }

  const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md'));
  let errors = 0;

  for (const file of files) {
    const fp = path.join(COMMANDS_DIR, file);
    let content;
    try { content = fs.readFileSync(fp, 'utf-8'); } catch (e) {
      console.error(`ERROR: ${file} - ${e.message}`);
      errors++; continue;
    }

    if (content.trim().length === 0) {
      console.error(`ERROR: ${file} - Empty file`);
      errors++;
    }
  }

  console.log(`Validated ${files.length} command files (${errors} errors)`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
