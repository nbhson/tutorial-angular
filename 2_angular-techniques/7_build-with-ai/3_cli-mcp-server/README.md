# Angular CLI MCP Server Setup

> Nguồn: https://angular.dev/ai/mcp

## Tổng quan
Angular CLI tích hợp MCP server để AI assistants (Cursor, Antigravity, JetBrains AI, VSCode) gọi trực tiếp CLI: sinh code, phân tích workspace, chạy build/test.

## Điểm chính
- Lệnh chạy: `npx @angular/cli mcp`
- Options: `--read-only` (chỉ tools không sửa project), `--local-only` (không cần internet).

## Ví dụ Code

### Cấu hình Antigravity
```json
// .antigravity/mcp.json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

### Tools mặc định (v22)
| Tool | Mô tả |
|---|---|
| `ai_tutor` | Mở AI tutor tương tác |
| `devserver.start/stop/wait_for_build` | Chạy `ng serve` nền, đọc build logs |
| `get_best_practices` | Lấy Best Practices đúng version (standalone, typed forms...) |
| `list_projects` | Liệt kê apps/libs từ `angular.json` |
| `onpush_zoneless_migration` | Lập plan migrate sang `OnPush`/zoneless từng bước |
| `run_target` | Chạy `build/test/lint/e2e/deploy` |
| `search_documentation` | Tìm docs https://angular.dev |

### Workflow mẫu — migrate OnPush/zoneless
```text
1. list_projects → tìm components
2. ng generate signal migrations (inputs/queries)
3. onpush_zoneless_migration <path> → apply 1 change
4. run_target test → verify
5. lặp lại tới khi xong
```

## Tham khảo
- [Angular CLI MCP Server setup](https://angular.dev/ai/mcp)
