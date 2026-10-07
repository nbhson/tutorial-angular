# Agent Skills (New)

> Nguồn: https://angular.dev/ai/agent-skills

## Tổng quan
Agent Skills là instructions chuyên biệt cho AI agents (Gemini CLI, Antigravity...). Angular team maintain 2 skills chính thức, update theo từng release.

## Điểm chính
| Skill | Dùng khi nào |
|---|---|
| `angular-developer` | Sinh code, hỏi best practices: signals, `linkedSignal`, `resource`, forms, DI, routing, SSR, ARIA, animations, testing, CLI |
| `angular-new-app` | Scaffold app mới bằng Angular CLI đúng cấu trúc modern |

## Ví dụ Code
```bash
# Cài skills chính thức (dùng cho mọi agent hỗ trợ skills.sh)
npx skills add https://github.com/angular/skills
```

```bash
# Gemini CLI — skill tự load khi hỏi Angular
gemini "tạo signal form đăng ký user với validators date/limit (v22 stable)"
# Agent có skill angular-developer sẽ dùng form(), FormField, không dùng ReactiveForms cũ
```

## Kết hợp với MCP Server
Skills = hướng dẫn (guidelines), MCP Server = tay chân (build/test/dev-server). Host hỗ trợ cả hai (ví dụ Antigravity) cho agent mạnh nhất.

## Tham khảo
- [Agent Skills](https://angular.dev/ai/agent-skills)
- [angular/skills repo](https://github.com/angular/skills)
