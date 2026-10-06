# III. Developer Experience (Angular 20)

Tổng hợp các feature mới tập trung vào Developer Experience trong Angular 20.

## Danh sách Features

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Zoneless Change Detection](1_zoneless-change-detection-FULL-VERSION/README.md) | `provideZonelessChangeDetection()` — v20 **Developer Preview** (+`provideBrowserGlobalErrorListeners` #60704); stable 20.2, default 21 |
| 2 | [Signal Diagnostics](2_signal-diagnostics/README.md) | KHÔNG có `.debug` public API — feature thật là DevTools signals + `provideCheckNoChangesConfig()` (#60906) |
| 3 | [Template Type Checking](3_template-type-checking/README.md) | `strictTemplates` có từ **v9** — mới v20 chỉ là host-bindings polish (#60267) + extended diagnostics (#60495/#60279/#59443) |
| 4 | [angular.dev](4_angular-dev/README.md) | Launch từ **v17–v18**, KHÔNG phải mới v20 — chỉ nhắc lại |
| 5 | [angular.dev CLI](5_angular-dev-cli/README.md) | KHÔNG có `ng analyze` / `ng performance` — CLI thật v20: schematic `--zoneless`, template HMR default, `ng update` |

## Yêu cầu

- Angular 20+
- Node.js >=20.11.1 (drop Node 18)

## Tổng quan

### Zoneless Change Detection

Angular 20 cho phép bỏ hoàn toàn Zone.js, sử dụng Signals để tự động phát hiện thay đổi. Giảm bundle size, improve performance.

### Signal Diagnostics

Công cụ debug mới giúp developer hiểu tại sao signal không cập nhật, component không re-render.

### Template Type Checking

Improved strictness cho template types, bắt lỗi sớm hơn khi build.

### angular.dev

Documentation site launch từ **v17–v18** (KHÔNG phải mới v20), thay thế angular.io.

### angular.dev CLI

KHÔNG có `ng analyze` / `ng performance` / `ng generate ... --mock`. CLI thật v20: schematic `--zoneless`, template HMR default, `ng update`, `TestBed.tick()`.