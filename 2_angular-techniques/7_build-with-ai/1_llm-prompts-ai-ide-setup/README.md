# LLM Prompts & AI IDE Setup

> Nguồn: https://angular.dev/ai/develop-with-ai

## Tổng quan
Angular cung cấp prompts/llms chuẩn để AI IDE (Cursor, VSCode, Antigravity, JetBrains AI) sinh code đúng signals-first, standalone, zoneless.

## Điểm chính
- Dùng `get_best_practices` + `search_documentation` của MCP Server thay vì copy docs cũ.
- Luôn yêu cầu AI tuân thủ: standalone components, `input()`/`model()` signals, `OnPush` (default v22), `inject()` thay constructor injection.
- Thêm `.cursor/rules` hoặc `AGENTS.md` dẫn tới `https://angular.dev/llms.txt`.

## Ví dụ Code

### Prompt chuẩn cho component mới
```text
Tạo Angular 22 standalone component dùng signals:
- input() thay @Input, model() cho two-way
- ChangeDetection mặc định OnPush (không set tay)
- dùng inject() thay constructor
- template dùng @if/@for/@let, không dùng *ngIf/*ngFor
```

### Cấu hình IDE (Cursor)
```json
// .cursor/mcp.json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

```json
// .vscode/mcp.json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

## Vì Sao Quan Trọng
Tránh AI sinh code Angular cũ (NgModules, `*ngIf`, constructor injection) — lỗi phổ biến nhất khi dùng AI.

## Tham khảo
- [LLM prompts and AI IDE setup](https://angular.dev/ai/develop-with-ai)
- [CLI MCP Server setup](https://angular.dev/ai/mcp)
