# Dev Tools — Tổng quan

Công cụ phát triển cho Angular v22: lint, test, CLI, devtools, thư viện.

| # | Folder | Chủ đề |
|---|---|---|
| 1 | [1-setup-tslint/](1-setup-tslint/README.md) | Lint setup — **nội dung đã viết lại: ESLint flat config + @angular-eslint** (TSLint đã khai tử từ 2021) |
| 9 | [9-angular-cli/](9-angular-cli/README.md) | Angular CLI — các lệnh cơ bản |
| 16 | [16-angular-jest-framework/](16-angular-jest-framework/README.md) | Unit test — **đã viết lại: Vitest mặc định từ Angular v21** |
| 20 | [20-ng-update-keeping-up-to-date/](20-ng-update-keeping-up-to-date/README.md) | `ng update` — nâng cấp phiên bản |
| 21 | [21-language-service-devtools-guide/](21-language-service-devtools-guide/README.md) | Language Service & Angular DevTools |
| 22 | [22-angular-libraries/](22-angular-libraries/README.md) | Tạo và dùng thư viện Angular |
| 23 | [23-tailwind-integration/](23-tailwind-integration/README.md) | Tích hợp Tailwind CSS |

## Toolchain chuẩn của Angular v22

```
Lint:   ESLint v9/v10 + eslint.config.js + angular-eslint
Test:   Vitest (mặc định) + zoneless testing
Build:  esbuild application builder (Vite dev server)
AI:     Angular CLI MCP server (`npx @angular/cli mcp`)
```

## Tham khảo

- [CLI Reference — angular.dev](https://angular.dev/cli)
- [angular-eslint](https://github.com/angular-eslint/angular-eslint)
- [Testing — angular.dev](https://angular.dev/guide/testing)
