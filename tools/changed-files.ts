import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"

interface ChangedFile {
  path: string
  type: "added" | "modified" | "deleted"
}

let changedFiles: Map<string, ChangedFile> = new Map()

export function recordChange(filePath: string, type: "added" | "modified" | "deleted") {
  changedFiles.set(filePath, { path: filePath, type })
}

export function getChanges(): ChangedFile[] {
  return Array.from(changedFiles.values())
}

export function clearChanges() {
  changedFiles.clear()
}

export const listChangedFiles = tool({
  description: "List files changed by agents in the current session. Returns a navigable tree with change indicators.",
  args: {
    format: z.enum(["tree", "json", "list"]).default("tree").describe("Output format"),
    typeFilter: z.enum(["added", "modified", "deleted"]).optional().describe("Filter by change type"),
  },
  async execute({ format = "tree", typeFilter }) {
    let files = getChanges()
    const outputFormat = format

    if (typeFilter) {
      files = files.filter((f) => f.type === typeFilter)
    }
    if (files.length === 0) {
      return JSON.stringify({ files: [], tree: "No files changed in this session" })
    }

    const prefix: Record<string, string> = { added: "+", modified: "~", deleted: "-" }
    const fileTree = files.map((f) => `${prefix[f.type] || " "} ${f.path}`).sort().join("\n")

    if (outputFormat === "json") {
      return JSON.stringify({
        total: files.length,
        byType: {
          added: files.filter((f) => f.type === "added").length,
          modified: files.filter((f) => f.type === "modified").length,
          deleted: files.filter((f) => f.type === "deleted").length,
        },
        files: files.sort((a, b) => a.path.localeCompare(b.path)),
      })
    }

    if (outputFormat === "list") {
      return JSON.stringify({ files: files.map((f) => f.path).sort(), total: files.length })
    }

    return JSON.stringify({
      total: files.length,
      tree: fileTree,
      summary: `${files.length} file(s) changed: ${files.filter((f) => f.type === "added").length} added, ${files.filter((f) => f.type === "modified").length} modified, ${files.filter((f) => f.type === "deleted").length} deleted`,
    })
  },
})
