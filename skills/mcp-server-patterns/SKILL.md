---
name: mcp-server-patterns
description: MCP server patterns covering tool design, resource exposure, prompt templates, transport configuration, and testing. Use when building MCP servers.
---

# MCP Server Patterns

## Tool Design
```typescript
server.tool("get_user", "Fetch user by ID", {
  id: z.string().describe("User ID"),
}, async ({ id }) => {
  const user = await db.users.findById(id)
  return {
    content: [{ type: "text", text: JSON.stringify(user) }]
  }
})
```

- One tool = one operation
- Clear descriptions with parameter details
- Validate inputs with Zod schema
- Return structured content

## Resource Exposure
```typescript
server.resource("config://app", "app-config", async (uri) => ({
  contents: [{
    uri: uri.href,
    text: JSON.stringify(config),
    mimeType: "application/json"
  }]
}))
```

## Prompt Templates
```typescript
server.prompt("code-review", "Review code for issues", {
  code: z.string(),
  language: z.string()
}, ({ code, language }) => ({
  messages: [{
    role: "user",
    content: { type: "text", text: `Review this ${language} code:\n${code}` }
  }]
}))
```

## Transport
- **stdio** — standard input/output (default)
- **SSE** — HTTP server-sent events
- **Streamable** — HTTP streaming

## Testing
- `@modelcontextprotocol/sdk` test utilities
- Test each tool with valid and invalid inputs
- Mock external dependencies
- Verify error messages
