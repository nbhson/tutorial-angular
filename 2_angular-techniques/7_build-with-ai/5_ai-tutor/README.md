# Angular AI Tutor

> Nguồn: https://angular.dev/ai/ai-tutor (tool `ai_tutor` trong MCP Server)

## Tổng quan
AI Tutor là persona học tương tác chạy qua MCP tool `ai_tutor`. Agent quét workspace (`list_projects`) rồi dạy theo curriculum: giải thích concept, giao bài sửa component, verify bằng `run_target test/build`.

## Điểm chính
- Dành cho onboarding dev mới / học signals, zoneless, forms.
- Luồng: `list_projects` → `ai_tutor` (load curriculum) → làm bài → `run_target` verify.
- Khác WebMCP: Tutor chạy trong IDE, WebMCP chạy trong trình duyệt.

## Ví dụ Code
```text
// Trong IDE có MCP Server:
> @angular-cli dùng ai_tutor dạy tôi signals từ đầu
// Agent: giải thích signal/computed/effect → yêu cầu tạo counter component
// → chạy run_target build để chấm bài
```

## Tham khảo
- [Angular AI Tutor](https://angular.dev/ai/ai-tutor)
- [CLI MCP Server — workflow onboarding](https://angular.dev/ai/mcp)
