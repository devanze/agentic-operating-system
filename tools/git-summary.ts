import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"
import { execSync } from "child_process"

function exec(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, encoding: "utf-8", timeout: 15_000 }).trim()
  } catch {
    return ""
  }
}

export const gitSummary = tool({
  description: "Generate a git summary: branch name, working tree status, recent commit log, staged diff, and branch diff.",
  args: {
    project: z.string().optional().describe("Project directory path"),
    baseBranch: z.string().default("main").describe("Base branch for diff"),
    recentCommits: z.number().default(5).describe("Number of recent commits to show"),
  },
  async execute({ project, baseBranch = "main", recentCommits = 5 }, ctx) {
    const dir = project || ctx.directory || process.cwd()
    const base = baseBranch
    const count = Math.min(recentCommits, 20)

    const branch = exec("git branch --show-current", dir) || exec("git rev-parse --abbrev-ref HEAD", dir) || "unknown"
    const status = exec("git status --porcelain", dir)
    const log = exec(`git log --oneline -${count}`, dir)
    const stagedDiff = exec("git diff --cached --stat", dir)
    const branchDiff = exec(`git diff ${base}...${branch} --stat 2>/dev/null`, dir)
    const changedFilesStr = exec(`git diff ${base}...${branch} --name-only 2>/dev/null`, dir)

    return JSON.stringify({
      branch,
      baseBranch: base,
      workingTree: status ? status.split("\n").filter(Boolean) : [],
      isClean: status === "",
      stagedFiles: stagedDiff ? stagedDiff.split("\n").length - 1 : 0,
      recentCommits: log ? log.split("\n").filter(Boolean).map((l: string) => {
        const [hash, ...rest] = l.split(" ")
        return { hash, message: rest.join(" ") }
      }) : [],
      changesVsBase: branchDiff || "No changes vs base branch",
      changedFileList: changedFilesStr ? changedFilesStr.split("\n").filter(Boolean) : [],
      totalChangedFiles: changedFilesStr ? changedFilesStr.split("\n").filter(Boolean).length : 0,
    })
  },
})
