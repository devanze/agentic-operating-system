#!/usr/bin/env bash
set -euo pipefail

DEST="${1:-.}"

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   OpenCode Agent System — Installer v1.2.0  ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""
echo "  Installing to: $DEST/.opencode/"
echo ""

mkdir -p "$DEST/.opencode"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

copy_dir() {
  local src="$SCRIPT_DIR/$1"
  local dst="$DEST/.opencode/$1"
  if [ -d "$src" ]; then
    mkdir -p "$dst"
    cp -r "$src"/* "$dst/"
    echo "  ✅ $1/"
  fi
}

copy_file() {
  local src="$SCRIPT_DIR/$1"
  local dst="$DEST/.opencode/$1"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    echo "  ✅ $1"
  fi
}

copy_dir agents
copy_dir skills
copy_dir commands
copy_dir plugins
copy_dir tools
copy_dir scripts
copy_dir instructions
copy_dir rules
copy_file opencode.json
copy_file AGENTS.md
copy_file package.json
copy_file package-lock.json

if [ ! -f "$DEST/AGENTS.md" ]; then
  cat > "$DEST/AGENTS.md" << 'PROJECTMD'
# Project Instructions

Add your project-specific rules, conventions, and domain knowledge here.

## Tech Stack
(Describe your tech stack)

## Project Conventions
(Describe your project-specific conventions)

## Domain Knowledge
(Describe your business domain terms and rules)

This file is yours — edit freely. The system has its own `.opencode/AGENTS.md`.
PROJECTMD
  echo "  ✅ AGENTS.md (project root — template created)"
else
  echo "  ℹ️  AGENTS.md (project root — already exists, not overwritten)"
fi

echo ""
echo "  ──────────────────────────────────────"
echo "   Done! $DEST/.opencode/ is ready."
echo "   Run 'opencode' in $DEST to use."
echo "  ──────────────────────────────────────"
echo ""
