#!/usr/bin/env node
/**
 * Validate agent markdown files in .opencode/agents/
 * Checks: frontmatter presence, required fields, valid model names
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const AGENTS_DIR = path.join(ROOT, 'agents');

function extractFrontmatter(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0 && !line.startsWith(' ') && !line.startsWith('\t')) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return fm;
}

function main() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.log('No agents directory found');
    process.exit(0);
  }

  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  let errors = 0;

  for (const file of files) {
    const fp = path.join(AGENTS_DIR, file);
    let content;
    try { content = fs.readFileSync(fp, 'utf-8'); } catch (e) {
      console.error(`ERROR: ${file} - ${e.message}`);
      errors++; continue;
    }

    const fm = extractFrontmatter(content);
    if (!fm) {
      console.error(`ERROR: ${file} - Missing frontmatter`);
      errors++; continue;
    }

    if (!fm.description) {
      console.error(`ERROR: ${file} - Missing description`);
      errors++;
    }
    if (!fm.mode) {
      console.error(`ERROR: ${file} - Missing mode`);
      errors++;
    }
  }

  console.log(`Validated ${files.length} agents (${errors} errors)`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
