#!/usr/bin/env node
/**
 * Validate skill directories in .opencode/skills/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log('No skills directory found');
    process.exit(0);
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name);
  let errors = 0;

  for (const dir of dirs) {
    const skillMd = path.join(SKILLS_DIR, dir, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      console.error(`ERROR: ${dir}/ - Missing SKILL.md`);
      errors++; continue;
    }
    const content = fs.readFileSync(skillMd, 'utf-8');
    if (content.trim().length === 0) {
      console.error(`ERROR: ${dir}/SKILL.md - Empty`);
      errors++;
    }
  }

  console.log(`Validated ${dirs.length} skill directories (${errors} errors)`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
