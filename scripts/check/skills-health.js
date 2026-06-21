#!/usr/bin/env node
/**
 * Skills health check — validates all skill packs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

function checkSkill(dir) {
  const issues = [];
  const skillMd = path.join(SKILLS_DIR, dir, 'SKILL.md');

  if (!fs.existsSync(skillMd)) {
    issues.push({ severity: 'error', msg: 'Missing SKILL.md' });
    return issues;
  }

  const content = fs.readFileSync(skillMd, 'utf8');
  if (content.trim().length === 0) {
    issues.push({ severity: 'error', msg: 'Empty SKILL.md' });
    return issues;
  }

  if (!content.includes('## ') && !content.includes('### ')) {
    issues.push({ severity: 'warn', msg: 'No section headers found' });
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount < 100) {
    issues.push({ severity: 'warn', msg: `Short content (${wordCount} words)` });
  }

  return issues;
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log('No skills directory');
    process.exit(0);
  }

  const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name);

  let healthy = 0;
  let warn = 0;
  let error = 0;

  for (const dir of dirs) {
    const issues = checkSkill(dir);
    if (issues.length === 0) {
      healthy++;
    } else {
      const hasError = issues.some(i => i.severity === 'error');
      if (hasError) error++;
      else warn++;

      console.log(`${hasError ? 'ERROR' : 'WARN'}  ${dir}:`);
      for (const issue of issues) {
        console.log(`    ${issue.msg}`);
      }
    }
  }

  console.log(`\nSkills health: ${healthy} healthy, ${warn} warnings, ${error} errors`);
  process.exit(error > 0 ? 1 : 0);
}

main();
