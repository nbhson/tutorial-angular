# Build with AI — Tổng quan

> Nguồn: https://angular.dev/ai — Angular v22

Angular cung cấp 6 mảng AI chính. Repo này trước đây chỉ có `9_angular-22/4_webmcp/`, nay bổ sung đủ:

| # | Folder | Mapping angular.dev |
|---|---|---|
| 1 | [1_llm-prompts-ai-ide-setup/](1_llm-prompts-ai-ide-setup/README.md) | `/ai/develop-with-ai` — LLM prompts + AI IDE setup |
| 2 | [2_agent-skills/](2_agent-skills/README.md) | `/ai/agent-skills` (New) — `angular-developer`, `angular-new-app` |
| 3 | [3_cli-mcp-server/](3_cli-mcp-server/README.md) | `/ai/mcp` — `npx @angular/cli mcp` |
| 4 | [4_design-patterns-ai/](4_design-patterns-ai/README.md) | `/ai/design-patterns` |
| 5 | [5_ai-tutor/](5_ai-tutor/README.md) | `/ai/ai-tutor` — `ai_tutor` tool |
| — | `4_angular-new-feature/9_angular-22/4_webmcp/` | `/ai/webmcp` (đã có, demo đầy đủ) |

## Mối quan hệ

```
Agent Skills (hướng dẫn) + CLI MCP Server (hành động) = dev agent hoàn chỉnh
WebMCP (trong trình duyệt) ≠ MCP Server (trong IDE/CLI)
AI Tutor (học) dùng chung tool `ai_tutor` của MCP Server
```

## Tham khảo
- [Build with AI — Get Started](https://angular.dev/ai)
- [Agent Skills](https://angular.dev/ai/agent-skills)
- [CLI MCP Server setup](https://angular.dev/ai/mcp)
