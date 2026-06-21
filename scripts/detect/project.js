#!/usr/bin/env node
/**
 * Auto-detect project type, language, and framework
 * Scans marker files and dependencies in current directory
 */
const fs = require('fs');
const path = require('path');

const cwd = process.argv[2] || process.cwd();

function exists(file) { try { return fs.existsSync(path.join(cwd, file)); } catch { return false; } }

function readJSON(file) { try { return JSON.parse(fs.readFileSync(path.join(cwd, file), 'utf8')); } catch { return null; } }

const DETECTORS = [
  { language: 'python', framework: 'django', markers: ['manage.py'], npmKey: null },
  { language: 'python', framework: 'fastapi', markers: [], npmKey: null },
  { language: 'python', framework: 'flask', markers: [], npmKey: null },
  { language: 'python', framework: null, markers: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'], npmKey: null },

  { language: 'typescript', framework: 'nextjs', markers: ['next.config.js', 'next.config.mjs', 'next.config.ts'], npmKey: 'next' },
  { language: 'typescript', framework: 'react', markers: [], npmKey: 'react' },
  { language: 'typescript', framework: 'angular', markers: ['angular.json'], npmKey: '@angular/core' },
  { language: 'typescript', framework: 'vue', markers: ['vue.config.js'], npmKey: 'vue' },
  { language: 'typescript', framework: 'nestjs', markers: ['nest-cli.json'], npmKey: '@nestjs/core' },
  { language: 'typescript', framework: 'svelte', markers: ['svelte.config.js'], npmKey: 'svelte' },
  { language: 'typescript', framework: 'astro', markers: ['astro.config.mjs'], npmKey: 'astro' },
  { language: 'typescript', framework: null, markers: ['tsconfig.json'], npmKey: null },

  { language: 'javascript', framework: 'express', markers: [], npmKey: 'express' },
  { language: 'javascript', framework: null, markers: ['package.json'], npmKey: null },

  { language: 'golang', framework: null, markers: ['go.mod', 'go.sum'], npmKey: null },

  { language: 'rust', framework: null, markers: ['Cargo.toml', 'Cargo.lock'], npmKey: null },

  { language: 'ruby', framework: 'rails', markers: ['config/routes.rb', 'bin/rails'], npmKey: null },
  { language: 'ruby', framework: null, markers: ['Gemfile', 'Rakefile'], npmKey: null },

  { language: 'java', framework: 'spring', markers: [], npmKey: null },
  { language: 'java', framework: null, markers: ['pom.xml', 'build.gradle', 'build.gradle.kts'], npmKey: null },

  { language: 'php', framework: 'laravel', markers: ['artisan'], npmKey: null },
  { language: 'php', framework: 'symfony', markers: ['symfony.lock'], npmKey: null },
  { language: 'php', framework: null, markers: ['composer.json'], npmKey: null },

  { language: 'kotlin', framework: null, markers: [], npmKey: null },
  { language: 'swift', framework: null, markers: ['Package.swift'], npmKey: null },
  { language: 'dart', framework: 'flutter', markers: ['pubspec.yaml'], npmKey: null },
  { language: 'csharp', framework: null, markers: [], npmKey: null },
];

const languages = [];
const frameworks = [];

const pkg = readJSON('package.json');
const npmDeps = pkg ? [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})] : [];

// pyproject.toml is TOML, not JSON — use file existence as marker only
const hasPyproject = exists('pyproject.toml');
const pyDeps = [];

for (const det of DETECTORS) {
  const hasMarker = det.markers.some(m => exists(m));
  const hasDep = det.npmKey && npmDeps.some(d => d === det.npmKey || d.startsWith(`${det.npmKey}/`));

  if (hasMarker || hasDep) {
    if (det.language && !languages.includes(det.language)) languages.push(det.language);
    if (det.framework && !frameworks.includes(det.framework)) frameworks.push(det.framework);
  }
}

// Deduplicate typescript/javascript
if (languages.includes('typescript')) {
  const idx = languages.indexOf('javascript');
  if (idx !== -1) languages.splice(idx, 1);
}

const primary = frameworks[0] || languages[0] || 'unknown';

console.log(JSON.stringify({
  projectDir: cwd,
  primary,
  languages: [...new Set(languages)],
  frameworks: [...new Set(frameworks)]
}, null, 2));
