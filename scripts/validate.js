#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const OK = "  ✅", FAIL = "  ❌", WARN = "  ⚠️"

let errors = 0, warnings = 0

function check(ok, msg) { if (!ok) { console.log(FAIL, msg); errors++ } }
function warn(ok, msg) { if (!ok) { console.log(WARN, msg); warnings++ } }
function info(msg) { console.log("  ℹ️", msg) }

function readDirSafe(dirPath) {
  try { return fs.readdirSync(dirPath) } catch { return [] }
}

// ─── Phase 1: opencode.json integrity ───
console.log("\n=== PHASE 1: opencode.json ===")
let cfg
try {
  cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "opencode.json"), "utf-8"))
} catch (e) {
  console.log(FAIL, `Cannot parse opencode.json: ${e.message}`)
  process.exit(1)
}

const definedAgents = Object.keys(cfg.agent || {})
const definedCommands = Object.keys(cfg.command || {})

console.log(`Agents defined: ${definedAgents.length}`)
console.log(`Commands defined: ${definedCommands.length}`)

// ─── Phase 2: Agent files exist & match config ───
console.log("\n=== PHASE 2: Agent Files ===")
const agentDir = path.join(ROOT, "agents")
const agentFiles = readDirSafe(agentDir).filter(f => f.endsWith(".md")).map(f => f.replace(".md", ""))
console.log(`Agent files: ${agentFiles.length}`)

  // Agents in config but no file
  for (const a of definedAgents) {
    if (!agentFiles.includes(a)) {
      // Skip if agent has inline system prompt (no file needed)
      if (cfg.agent?.[a]?.system) continue
      check(false, `Agent "${a}" in opencode.json but no agents/${a}.md file`)
    } else {
    const content = fs.readFileSync(path.join(agentDir, a + ".md"), "utf-8")
    const hasModel = content.includes("model:") || cfg.agent?.[a]?.model
    const hasDesc = content.includes("description:") || (cfg.agent?.[a]?.description || "").length > 3
    check(hasModel || a === "orchestrator", `Agent ${a} has no model reference`)
    check(hasDesc, `Agent ${a} has description`)

    // Check if prompt file reference is valid
    const promptFile = cfg.agent?.[a]?.prompt
    if (promptFile && typeof promptFile === "string" && promptFile.startsWith("{file:")) {
      const refPath = promptFile.replace("{file:", "").replace("}", "")
      const fullPath = path.join(ROOT, refPath)
      check(fs.existsSync(fullPath), `Agent ${a} references ${refPath} — file exists`)
    }
  }
}

// Agent files without config entry
for (const a of agentFiles) {
  warn(definedAgents.includes(a), `File agents/${a}.md exists but NOT in opencode.json agent list`)
}

// ─── Phase 3: Command files exist & match ───
console.log("\n=== PHASE 3: Command Files ===")
const cmdDir = path.join(ROOT, "commands")
const cmdFiles = readDirSafe(cmdDir).filter(f => f.endsWith(".md")).map(f => f.replace(".md", ""))
console.log(`Command files: ${cmdFiles.length}`)

for (const c of definedCommands) {
  check(cmdFiles.includes(c), `Command "/${c}" in config but no commands/${c}.md file`)
}

for (const c of cmdFiles) {
  warn(definedCommands.includes(c), `File commands/${c}.md exists but NOT in opencode.json command list`)
}

// Commands mapped to non-existent agents
for (const c of definedCommands) {
  const agent = cfg.command?.[c]?.agent
  if (agent && !definedAgents.includes(agent)) {
    check(false, `Command "/${c}" maps to agent "${agent}" but agent not defined`)
  }
}

// ─── Phase 4: Skills vs instructions list ───
console.log("\n=== PHASE 4: Skills ===")
const skillsDir = path.join(ROOT, "skills")
const skillDirs = readDirSafe(skillsDir).filter(f => {
  const p = path.join(skillsDir, f)
  return fs.statSync(p).isDirectory()
}).filter(d => fs.existsSync(path.join(skillsDir, d, "SKILL.md")))
console.log(`Skill packs: ${skillDirs.length}`)

const referencedSkills = cfg.instructions?.filter(i => i.includes("skills/") && i.includes("SKILL.md")) || []
console.log(`Skills in instructions: ${referencedSkills.length}`)

// Skills in instructions but no dir
for (const ref of referencedSkills) {
  const parts = ref.split("/")
  const skillName = parts[1]
  check(skillDirs.includes(skillName), `Skill "${skillName}" in instructions but no skills/${skillName}/SKILL.md exists`)
}

// Skill dirs not in instructions
for (const s of skillDirs) {
  const found = referencedSkills.some(r => r.includes(`skills/${s}/`))
  warn(found, `Skill "${s}" exists on disk but NOT in opencode.json instructions`)
}

// Check SKILL.md frontmatter
for (const s of skillDirs) {
  const skillFile = path.join(skillsDir, s, "SKILL.md")
  const content = fs.readFileSync(skillFile, "utf-8")
  const hasName = content.includes("name:")
  const hasDesc = content.includes("description:")
  check(hasName, `Skill ${s} has 'name:' in frontmatter`)
  check(hasDesc, `Skill ${s} has 'description:' in frontmatter`)
}

// ─── Phase 5: Rules integrity ───
console.log("\n=== PHASE 5: Rules ===")
const rulesDir = path.join(ROOT, "rules")
const ruleDirs = readDirSafe(rulesDir).filter(f => fs.statSync(path.join(rulesDir, f)).isDirectory())
console.log(`Rulesets: ${ruleDirs.length}`)
for (const r of ruleDirs) {
    const files = readDirSafe(path.join(rulesDir, r)).filter(f => f.endsWith(".md"))
  console.log(`  ${r}/ (${files.length} rules)`)
}

// ─── Phase 6: Plugin integrity ───
console.log("\n=== PHASE 6: Plugin ===")
const pluginDir = path.join(ROOT, "plugins")
const pluginFiles = readDirSafe(pluginDir).filter(f => f.endsWith(".ts"))
check(pluginFiles.includes("hooks.ts"), `Plugin hooks.ts exists`)

const hooksContent = fs.readFileSync(path.join(pluginDir, "hooks.ts"), "utf-8")
check(hooksContent.includes("export default"), `Plugin has default export`)
check(hooksContent.includes('"file.edited"'), `Plugin has file.edited hook`)
check(hooksContent.includes('"tool.execute.after"'), `Plugin has tool.execute.after hook`)
check(hooksContent.includes('"tool.execute.before"'), `Plugin has tool.execute.before hook`)
check(hooksContent.includes('"session.created"'), `Plugin has session.created hook`)
check(hooksContent.includes('"session.idle"'), `Plugin has session.idle hook`)
check(hooksContent.includes('"session.deleted"'), `Plugin has session.deleted hook`)
check(hooksContent.includes('"shell.env"'), `Plugin has shell.env hook`)
check(hooksContent.includes('"experimental.session.compacting"'), `Plugin has compacting hook`)
check(hooksContent.includes('"permission.ask"'), `Plugin has permission.ask hook`)

// Check tools registration
check(hooksContent.includes("run_tests:"), `Plugin registers run_tests tool`)
check(hooksContent.includes("check_coverage:"), `Plugin registers check_coverage tool`)
check(hooksContent.includes("security_audit:"), `Plugin registers security_audit tool`)
check(hooksContent.includes("format_code:"), `Plugin registers format_code tool`)
check(hooksContent.includes("lint_check:"), `Plugin registers lint_check tool`)
check(hooksContent.includes("git_summary:"), `Plugin registers git_summary tool`)
check(hooksContent.includes("changed_files:"), `Plugin registers changed_files tool`)

// ─── Phase 7: Tools integrity ───
console.log("\n=== PHASE 7: Tools ===")
const toolsDir = path.join(ROOT, "tools")
const toolFiles = readDirSafe(toolsDir).filter(f => f.endsWith(".ts"))
console.log(`Tool files: ${toolFiles.length}`)
const indexContent = fs.readFileSync(path.join(toolsDir, "index.ts"), "utf-8")
for (const t of ["run-tests", "security-audit", "format-code", "lint-check", "git-summary", "changed-files"]) {
  check(toolFiles.includes(`${t}.ts`), `Tool file ${t}.ts exists`)
}

// ─── Phase 8: Scripts ───
console.log("\n=== PHASE 8: Scripts ===")
const scriptsDir = path.join(ROOT, "scripts")
check(fs.existsSync(path.join(scriptsDir, "instinct.js")), `Instinct engine exists`)
if (fs.existsSync(path.join(scriptsDir, "instinct.js"))) {
  const instinctContent = fs.readFileSync(path.join(scriptsDir, "instinct.js"), "utf-8")
  check(instinctContent.includes("sql.js"), `Instinct engine uses sql.js`)
  check(instinctContent.includes("CREATE TABLE"), `Instinct engine has table creation`)
}

// ─── Phase 9: Cross-reference completeness ───
console.log("\n=== PHASE 9: Cross-references ===")

// MCP count
const mcpServers = Object.keys(cfg.mcp || {})
console.log(`MCP servers: ${mcpServers.length}`)
const enabledMCPs = mcpServers.filter(s => cfg.mcp?.[s]?.enabled !== false)
console.log(`MCP enabled: ${enabledMCPs.length}`)

// Instructions files exist
for (const inst of cfg.instructions || []) {
  if (!inst.includes("{file:")) {
    const instPath = path.join(ROOT, inst)
    check(fs.existsSync(instPath), `Instruction file exists: ${inst}`)
  }
}

// AGENTS.md exists
check(fs.existsSync(path.join(ROOT, "AGENTS.md")), `AGENTS.md exists`)

// ─── Phase 10: Duplicate detection ───
console.log("\n=== PHASE 10: Duplicates ===")
const agentDups = definedAgents.filter((a, i) => definedAgents.indexOf(a) !== i)
if (agentDups.length) {
  check(false, `Duplicate agents in config: ${agentDups.join(", ")}`)
}

const cmdDups = definedCommands.filter((c, i) => definedCommands.indexOf(c) !== i)
if (cmdDups.length) {
  check(false, `Duplicate commands in config: ${cmdDups.join(", ")}`)
}

// ─── Summary ───
console.log("\n=== RESULT ===")
console.log(`Errors: ${errors}`)
console.log(`Warnings: ${warnings}`)
console.log(`Agents: ${agentFiles.length} files / ${definedAgents.length} defined`)
console.log(`Commands: ${cmdFiles.length} files / ${definedCommands.length} defined`)
console.log(`Skills: ${skillDirs.length} dirs / ${referencedSkills.length} referenced`)
console.log(`MCP: ${mcpServers.length} total / ${enabledMCPs.length} enabled`)

if (errors === 0 && warnings === 0) {
  console.log("\n✅ ALL CHECKS PASSED")
} else if (errors === 0) {
  console.log(`\n⚠️ PASSED with ${warnings} warnings`)
} else {
  console.log(`\n❌ FAILED with ${errors} errors and ${warnings} warnings`)
  process.exit(1)
}
