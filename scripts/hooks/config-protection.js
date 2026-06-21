#!/usr/bin/env node
/**
 * Config Protection Hook
 *
 * Blocks modifications to linter/formatter config files.
 * Agents frequently modify these to make checks pass instead of fixing
 * the actual code. This hook steers the agent back to fixing the source.
 *
 * stdin: { tool: string, file_path: string }
 * stdout: { blocked: boolean, message?: string }
 */
const path = require('path');

const PROTECTED_FILES = new Set([
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json',
  '.eslintrc.yml', '.eslintrc.yaml',
  'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs',
  'eslint.config.ts', 'eslint.config.mts', 'eslint.config.cts',
  '.prettierrc', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.json',
  '.prettierrc.yml', '.prettierrc.yaml',
  'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs',
  'biome.json', 'biome.jsonc',
  '.ruff.toml', 'ruff.toml',
  '.shellcheckrc',
  '.stylelintrc', '.stylelintrc.json', '.stylelintrc.yml',
  '.markdownlint.json', '.markdownlint.yaml', '.markdownlintrc'
]);

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw.trim() || '{}'); } catch { input = {}; }

    const filePath = input.file_path || '';
    const tool = input.tool || '';

    if (!filePath) {
      process.stdout.write(JSON.stringify({ blocked: false }));
      return;
    }

    if (tool === 'bash') {
      for (const name of PROTECTED_FILES) {
        if (filePath.includes(name)) {
          process.stdout.write(JSON.stringify({
            blocked: true,
            message: `Command targets protected config file ${name} — fix source code, not the config`
          }));
          return;
        }
      }
      process.stdout.write(JSON.stringify({ blocked: false }));
      return;
    }

    if (!['edit', 'write'].includes(tool)) {
      process.stdout.write(JSON.stringify({ blocked: false }));
      return;
    }

    const basename = path.basename(filePath);
    if (!PROTECTED_FILES.has(basename)) {
      process.stdout.write(JSON.stringify({ blocked: false }));
      return;
    }

    let exists = false;
    try {
      require('fs').lstatSync(filePath);
      exists = true;
    } catch (err) {
      if (err.code !== 'ENOENT') exists = true;
    }

    if (exists) {
      process.stdout.write(JSON.stringify({
        blocked: true,
        message: `Modifying ${basename} is blocked — fix source code instead of weakening linter/formatter config`
      }));
      return;
    }

    process.stdout.write(JSON.stringify({ blocked: false }));
  });
}

main();
