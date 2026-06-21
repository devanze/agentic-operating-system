#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const INSTINCTS_DIR = path.join(process.cwd(), ".opencode", "instincts")
const DB_PATH = path.join(INSTINCTS_DIR, "instincts.db")
const JSON_PATH = path.join(INSTINCTS_DIR, "instincts.json")

let USE_SQLITE = true
try { require.resolve("sql.js") } catch { USE_SQLITE = false }

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }

function loadJSON() {
  ensureDir(INSTINCTS_DIR)
  if (!fs.existsSync(JSON_PATH)) {
    const empty = { instincts: [], sessions: [], projects: [] }
    fs.writeFileSync(JSON_PATH, JSON.stringify(empty, null, 2))
    return empty
  }
  return JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"))
}

function saveJSON(db) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(db, null, 2))
}

function getDB() {
  ensureDir(INSTINCTS_DIR)
  if (!USE_SQLITE) return loadJSON()

  const initSqlJs = require("sql.js")
  // initSqlJs is a function that returns a promise with SQL module
  return initSqlJs().then(SQL => _initSqlDB(SQL))
}

function _initSqlDB(SQL) {
  let db
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS instincts (
      id TEXT PRIMARY KEY,
      project_path TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      meta_json TEXT DEFAULT '{}',
      count INTEGER DEFAULT 1,
      cluster_id TEXT,
      promoted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(project_path, title, category)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_path TEXT NOT NULL,
      summary TEXT,
      learnings_json TEXT DEFAULT '[]',
      file_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      project_path TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      instinct_count INTEGER DEFAULT 0,
      session_count INTEGER DEFAULT 0,
      last_session_id TEXT,
      last_session_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.run("CREATE INDEX IF NOT EXISTS idx_instincts_project ON instincts(project_path)")
  db.run("CREATE INDEX IF NOT EXISTS idx_instincts_category ON instincts(project_path, category)")
  db.run("CREATE INDEX IF NOT EXISTS idx_instincts_cluster ON instincts(cluster_id)")
  db.run("CREATE INDEX IF NOT EXISTS idx_instincts_promoted ON instincts(promoted)")
  db.run("CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_path)")

  return db
}

// SQL.js db.exec() does not accept params — interpolate ? placeholders safely
function exec(db, sql, params = []) {
  if (!params || params.length === 0) return db.exec(sql)
  let idx = 0
  const interpolated = sql.replace(/\?/g, () => {
    const val = params[idx++]
    if (val === null || val === undefined) return "NULL"
    if (typeof val === "number") return String(val)
    return "'" + String(val).replace(/'/g, "''") + "'"
  })
  return db.exec(interpolated)
}

function saveDB(db) {
  if (!USE_SQLITE) { saveJSON(db); return }
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

class InstinctEngine {
  constructor(projectPath) {
    this.projectPath = projectPath || process.cwd()
    this.projectName = path.basename(this.projectPath)
    this._db = null
    this._ready = false
  }

  async _init() {
    if (this._ready) return
    this._db = await getDB()
    this._ensureProject()
    this._ready = true
  }

  _ensureReady() {
    if (!this._ready) throw new Error("Must call _init() before using InstinctEngine methods")
  }

  _ensureProject() {
    if (USE_SQLITE) {
      const row = exec(this._db, "SELECT project_path FROM projects WHERE project_path = ?", [this.projectPath])
      if (row.length === 0 || row[0].values.length === 0) {
        this._db.run("INSERT INTO projects (project_path, project_name) VALUES (?, ?)", [
          this.projectPath, this.projectName,
        ])
      }
      saveDB(this._db)
    } else {
      const exists = this._db.projects.find(p => p.projectPath === this.projectPath)
      if (!exists) {
        this._db.projects.push({
          projectPath: this.projectPath,
          projectName: this.projectName,
          instinctCount: 0,
          sessionCount: 0,
          lastSessionId: null,
          lastSessionAt: null,
        })
      }
      saveDB(this._db)
    }
  }

  _updateProjectStats() {
    let instinctCount, sessionCount, lastId, lastAt
    if (USE_SQLITE) {
      const iCount = exec(this._db, "SELECT COUNT(*) as c FROM instincts WHERE project_path = ?", [this.projectPath])
      const sCount = exec(this._db, "SELECT COUNT(*) as c FROM sessions WHERE project_path = ?", [this.projectPath])
      const lastSession = exec(this._db,
        "SELECT id, created_at FROM sessions WHERE project_path = ? ORDER BY created_at DESC LIMIT 1",
        [this.projectPath]
      )
      instinctCount = iCount[0]?.values?.[0]?.[0] || 0
      sessionCount = sCount[0]?.values?.[0]?.[0] || 0
      lastId = lastSession[0]?.values?.[0]?.[0] || null
      lastAt = lastSession[0]?.values?.[0]?.[1] || null

      this._db.run(
        "INSERT OR REPLACE INTO projects (project_path, project_name, instinct_count, session_count, last_session_id, last_session_at, created_at) VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM projects WHERE project_path = ?), datetime('now')))",
        [this.projectPath, this.projectName, instinctCount, sessionCount, lastId, lastAt, this.projectPath]
      )
    } else {
      const projInstincts = this._db.instincts.filter(i => i.projectPath === this.projectPath)
      const projSessions = this._db.sessions.filter(s => s.projectPath === this.projectPath)
      instinctCount = projInstincts.length
      sessionCount = projSessions.length
      const last = projSessions.slice(-1)[0]
      lastId = last?.id || null
      lastAt = last?.createdAt || null

      const proj = this._db.projects.find(p => p.projectPath === this.projectPath)
      if (proj) {
        proj.instinctCount = instinctCount
        proj.sessionCount = sessionCount
        proj.lastSessionId = lastId
        proj.lastSessionAt = lastAt
      }
    }
    saveDB(this._db)
  }

  async record(category, title, content, meta = {}) {
    await this._init()
    if (USE_SQLITE) {
      const id = crypto.randomUUID().slice(0, 8)
      this._db.run(`
        INSERT INTO instincts (id, project_path, category, title, content, meta_json, count, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
        ON CONFLICT(project_path, title, category) DO UPDATE SET
          count = count + 1,
          content = excluded.content,
          meta_json = excluded.meta_json,
          updated_at = datetime('now')
      `, [id, this.projectPath, category, title, content, JSON.stringify(meta)])
    } else {
      const existing = this._db.instincts.find(
        i => i.projectPath === this.projectPath && i.title === title && i.category === category
      )
      if (existing) {
        existing.count = (existing.count || 1) + 1
        existing.content = content
        existing.updatedAt = new Date().toISOString()
      } else {
        this._db.instincts.push({
          id: crypto.randomUUID().slice(0, 8),
          projectPath: this.projectPath,
          category, title, content,
          meta,
          count: 1,
          clusterId: null,
          promoted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
    this._updateProjectStats()
    return this.status()
  }

  async recordSession(sessionId, summary, learnings = [], fileCount = 0) {
    await this._init()
    if (USE_SQLITE) {
      this._db.run(`
        INSERT INTO sessions (id, project_path, summary, learnings_json, file_count, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          summary = excluded.summary,
          learnings_json = excluded.learnings_json,
          file_count = excluded.file_count,
          updated_at = datetime('now')
      `, [sessionId, this.projectPath, summary, JSON.stringify(learnings), fileCount])
    } else {
      const existing = this._db.sessions.find(s => s.id === sessionId && s.projectPath === this.projectPath)
      if (existing) {
        existing.summary = summary
        existing.learnings = learnings
        existing.fileCount = fileCount
        existing.updatedAt = new Date().toISOString()
      } else {
        this._db.sessions.push({
          id: sessionId,
          projectPath: this.projectPath,
          summary,
          learnings,
          fileCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
    this._updateProjectStats()
    return this.status()
  }

  status() {
    this._ensureReady()
    this._ensureProject()
    let instinctCount, globalInstinctCount, sessionCount, categories, clusters, recentInstincts, recentSessions

    if (USE_SQLITE) {
      const totalI = exec(this._db, "SELECT COUNT(*) FROM instincts WHERE project_path = ?", [this.projectPath])
      const globalI = exec(this._db, "SELECT COUNT(*) FROM instincts WHERE promoted = 1")
      const totalS = exec(this._db, "SELECT COUNT(*) FROM sessions WHERE project_path = ?", [this.projectPath])
      const cats = exec(this._db, "SELECT category, COUNT(*) as c FROM instincts WHERE project_path = ? GROUP BY category ORDER BY c DESC", [this.projectPath])
      const clust = exec(this._db, "SELECT cluster_id, COUNT(*) as c FROM instincts WHERE project_path = ? AND cluster_id IS NOT NULL GROUP BY cluster_id ORDER BY c DESC", [this.projectPath])
      const recentI = exec(this._db, "SELECT id, category, title, content, count, cluster_id, promoted FROM instincts WHERE project_path = ? ORDER BY updated_at DESC LIMIT 10", [this.projectPath])
      const recentS = exec(this._db, "SELECT id, summary, file_count, created_at FROM sessions WHERE project_path = ? ORDER BY created_at DESC LIMIT 5", [this.projectPath])

      const toObjects = (result, keys) => {
        if (!result || result.length === 0 || !result[0].values) return []
        return result[0].values.map(row => { const obj = {}; keys.forEach((k, i) => { obj[k] = row[i] }); return obj })
      }
      instinctCount = totalI[0]?.values?.[0]?.[0] || 0
      globalInstinctCount = globalI[0]?.values?.[0]?.[0] || 0
      sessionCount = totalS[0]?.values?.[0]?.[0] || 0
      categories = toObjects(cats, ["category", "count"])
      clusters = toObjects(clust, ["cluster_id", "count"])
      recentInstincts = toObjects(recentI, ["id", "category", "title", "content", "count", "cluster_id", "promoted"])
      recentSessions = toObjects(recentS, ["id", "summary", "file_count", "created_at"])
    } else {
      const projInstincts = this._db.instincts.filter(i => i.projectPath === this.projectPath)
      const projSessions = this._db.sessions.filter(s => s.projectPath === this.projectPath)
      instinctCount = projInstincts.length
      globalInstinctCount = this._db.instincts.filter(i => i.promoted).length
      sessionCount = projSessions.length

      const catMap = {}
      projInstincts.forEach(i => { catMap[i.category] = (catMap[i.category] || 0) + 1 })
      categories = Object.entries(catMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count)

      const clustMap = {}
      projInstincts.forEach(i => { if (i.clusterId) clustMap[i.clusterId] = (clustMap[i.clusterId] || 0) + 1 })
      clusters = Object.entries(clustMap).map(([cluster_id, count]) => ({ cluster_id, count })).sort((a, b) => b.count - a.count)

      recentInstincts = projInstincts.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 10).map(i => ({
        id: i.id, category: i.category, title: i.title, content: i.content, count: i.count, cluster_id: i.clusterId, promoted: i.promoted
      }))
      recentSessions = projSessions.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5).map(s => ({
        id: s.id, summary: s.summary, file_count: s.fileCount || 0, created_at: s.createdAt
      }))
    }

    return {
      project: this.projectName,
      path: this.projectPath,
      instinctCount,
      globalInstinctCount,
      sessionCount,
      categories,
      clusters,
      recentInstincts,
      recentSessions,
    }
  }

  list(category) {
    this._ensureReady()
    if (USE_SQLITE) {
      let sql = "SELECT id, category, title, content, count, cluster_id, promoted, updated_at FROM instincts WHERE project_path = ?"
      const params = [this.projectPath]
      if (category) { sql += " AND category = ?"; params.push(category) }
      sql += " ORDER BY count DESC"
      const result = exec(this._db, sql, params)
      if (!result.length || !result[0].values) return []
      return result[0].values.map(r => ({
        id: r[0], category: r[1], title: r[2], content: r[3], count: r[4], cluster_id: r[5], promoted: r[6], updated_at: r[7]
      }))
    }
    let items = this._db.instincts.filter(i => i.projectPath === this.projectPath)
    if (category) items = items.filter(i => i.category === category)
    return items.sort((a, b) => b.count - a.count).map(i => ({
      id: i.id, category: i.category, title: i.title, content: i.content, count: i.count, cluster_id: i.clusterId, promoted: i.promoted, updated_at: i.updatedAt
    }))
  }

  listGlobal() {
    this._ensureReady()
    if (USE_SQLITE) {
      const result = this._db.exec(
        "SELECT id, category, title, content, count, cluster_id, updated_at FROM instincts WHERE promoted = 1 ORDER BY count DESC"
      )
      if (!result.length || !result[0].values) return []
      return result[0].values.map(r => ({ id: r[0], category: r[1], title: r[2], content: r[3], count: r[4], cluster_id: r[5], updated_at: r[6] }))
    }
    return this._db.instincts.filter(i => i.promoted).sort((a, b) => b.count - a.count).map(i => ({
      id: i.id, category: i.category, title: i.title, content: i.content, count: i.count, cluster_id: i.clusterId, updated_at: i.updatedAt
    }))
  }

  evolve(minCount = 3) {
    this._ensureReady()
    if (!USE_SQLITE) {
      return { error: "evolve() requires SQLite mode. Install sql.js or use JSON mode for manual clustering." }
    }
    const result = exec(this._db,
      "SELECT id, category, title, count FROM instincts WHERE project_path = ? AND cluster_id IS NULL ORDER BY category",
      [this.projectPath]
    )
    if (!result.length || !result[0].values) return { clustered: [], totalClusters: 0 }

    const groups = {}
    result[0].values.forEach(r => {
      const id = r[0], category = r[1], title = r[2], count = r[3]
      const key = category + ":" + title.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (!groups[key]) groups[key] = []
      groups[key].push({ id, category, title, count })
    })

    const clustered = []
    Object.entries(groups).forEach(([key, group]) => {
      const totalCount = group.reduce((s, g) => s + g.count, 0)
      if (totalCount >= minCount && group.length >= 2) {
        const clusterId = crypto.randomUUID().slice(0, 6)
        const stmt = this._db.prepare("UPDATE instincts SET cluster_id = ? WHERE id = ?")
        group.forEach(g => { stmt.run([clusterId, g.id]) })
        stmt.free()
        clustered.push({ cluster: clusterId, category: group[0].category, instincts: group.map(g => g.title), totalCount })
      }
    })
    saveDB(this._db)
    return { clustered, totalClusters: clustered.length }
  }

  promote(instinctId) {
    this._ensureReady()
    this._db.run("UPDATE instincts SET promoted = 1 WHERE id = ? OR title = ?", [instinctId, instinctId])
    saveDB(this._db)
    const result = exec(this._db, "SELECT id, title FROM instincts WHERE (id = ? OR title = ?) AND promoted = 1", [instinctId, instinctId])
    if (!result.length || !result[0].values) return { error: "Instinct not found" }
    return { promoted: result[0].values.map(r => ({ id: r[0], title: r[1] })) }
  }

  promoteCluster(clusterId) {
    this._ensureReady()
    this._db.run("UPDATE instincts SET promoted = 1 WHERE cluster_id = ?", [clusterId])
    saveDB(this._db)
    const result = exec(this._db, "SELECT id, title FROM instincts WHERE cluster_id = ?", [clusterId])
    if (!result.length || !result[0].values) return { error: "Cluster not found" }
    return { promoted: result[0].values.length, instincts: result[0].values.map(r => r[1]) }
  }

  exportData(filename) {
    this._ensureReady()
    const target = filename || `instincts-${this.projectName}-${new Date().toISOString().slice(0, 10)}.json`
    const filepath = path.join(INSTINCTS_DIR, target)
    const instincts = this.list()
    let sessionData = []

    if (USE_SQLITE) {
      const sessions = exec(this._db,
        "SELECT id, summary, learnings_json, file_count, created_at FROM sessions WHERE project_path = ? ORDER BY created_at DESC",
        [this.projectPath]
      )
      sessionData = (!sessions.length || !sessions[0].values) ? [] : sessions[0].values.map(r => ({
        id: r[0], summary: r[1], learnings: JSON.parse(r[2] || "[]"), file_count: r[3], created_at: r[4]
      }))
    } else {
      sessionData = this._db.sessions.filter(s => s.projectPath === this.projectPath).map(s => ({
        id: s.id, summary: s.summary, learnings: s.learnings || [], file_count: s.fileCount || 0, created_at: s.createdAt
      }))
    }

    const data = { exportedAt: new Date().toISOString(), project: this.projectName, instincts, sessions: sessionData }
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    return { exported: filepath, instinctCount: instincts.length, sessionCount: sessionData.length }
  }

  importData(filepath) {
    this._ensureReady()
    const data = JSON.parse(fs.readFileSync(filepath, "utf-8"))
    let imported = 0
    const stmt = this._db.prepare(`
      INSERT OR IGNORE INTO instincts (id, project_path, category, title, content, meta_json, count, promoted, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    data.instincts.forEach(i => {
      const id = crypto.randomUUID().slice(0, 8)
      stmt.run([id, this.projectPath, i.category, i.title, i.content, JSON.stringify(i.meta || {}), i.count || 1, 0])
      imported++
    })
    stmt.free()
    this._updateProjectStats()
    return { imported, total: data.instincts.length }
  }

  suggestSkill(clusterId) {
    this._ensureReady()
    const result = exec(this._db, "SELECT id, category, title, content FROM instincts WHERE cluster_id = ?", [clusterId])
    if (!result.length || !result[0].values) return { error: "Cluster not found" }
    const items = result[0].values.map(r => ({ id: r[0], category: r[1], title: r[2], content: r[3] }))
    const category = items[0].category
    const content = items.map(i => `## ${i.title}\n\n${i.content}\n`).join("\n")
    return {
      skillName: clusterId,
      category,
      instinctCount: items.length,
      content,
      suggestion: `Create skill: skills/${clusterId}/SKILL.md with category="${category}"`,
    }
  }

  listProjects() {
    this._ensureReady()
    if (USE_SQLITE) {
      const result = this._db.exec(
        "SELECT project_name, project_path, instinct_count, session_count, last_session_at FROM projects ORDER BY last_session_at DESC"
      )
      if (!result.length || !result[0].values) return []
      return result[0].values.map(r => ({ name: r[0], path: r[1], instinctCount: r[2], sessionCount: r[3], lastSession: r[4] }))
    }
    return this._db.projects
      .sort((a, b) => (b.lastSessionAt || "").localeCompare(a.lastSessionAt || ""))
      .map(p => ({
      name: p.projectName, path: p.projectPath, instinctCount: p.instinctCount || 0, sessionCount: p.sessionCount || 0, lastSession: p.lastSessionAt
    }))
  }
}

;(async () => {
  const args = process.argv.slice(2)
  const cmd = args[0]
  const engine = new InstinctEngine(process.cwd())
  await engine._init()

  const commands = {
    status: async () => console.log(JSON.stringify(engine.status(), null, 2)),
    record: async () => {
      const [category, title, ...contentParts] = args.slice(1)
      console.log(JSON.stringify(await engine.record(category, title, contentParts.join(" ")), null, 2))
    },
    list: () => console.log(JSON.stringify(engine.list(args[1]), null, 2)),
    global: () => console.log(JSON.stringify(engine.listGlobal(), null, 2)),
    evolve: () => console.log(JSON.stringify(engine.evolve(parseInt(args[1]) || 3), null, 2)),
    promote: () => console.log(JSON.stringify(engine.promote(args[1]), null, 2)),
    "promote-cluster": () => console.log(JSON.stringify(engine.promoteCluster(args[1]), null, 2)),
    export: () => console.log(JSON.stringify(engine.exportData(args[1]), null, 2)),
    import: () => console.log(JSON.stringify(engine.importData(args[1]), null, 2)),
    recordSession: async () => {
      const [sessionId, summary] = args.slice(1)
      const fileCount = parseInt(args[3]) || 0
      console.log(JSON.stringify(await engine.recordSession(sessionId, summary || "", [], fileCount), null, 2))
    },
    suggest: () => console.log(JSON.stringify(engine.suggestSkill(args[1]), null, 2)),
    projects: () => console.log(JSON.stringify(engine.listProjects(), null, 2)),
  }

  if (commands[cmd]) {
    await commands[cmd]()
  } else {
    console.log(JSON.stringify({ error: "Unknown command", usage: "node instinct.js <status|record|list|global|evolve|promote|promote-cluster|export|import|recordSession|suggest|projects> [args]" }, null, 2))
  }
})()

module.exports = { InstinctEngine }
