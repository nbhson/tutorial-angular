# III. Developer Experience (Angular 20)

Tổng hợp các feature mới tập trung vào Developer Experience trong Angular 20.

## Danh sách Features

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Zoneless Change Detection](1_zoneless-change-detection/README.md) | Signal-based rendering, bỏ Zone.js |
| 2 | [Signal Diagnostics](2_signal-diagnostics/README.md) | Debug signals dễ dàng hơn |
| 3 | [Template Type Checking](3_template-type-checking/README.md) | Kiểm tra types trong template chính xác hơn |
| 4 | [angular.dev](4_angular-dev/README.md) | Documentation site mới |
| 5 | [angular.dev CLI](5_angular-dev-cli/README.md) | CLI tools mới |

## Tổng quan

### Zoneless Change Detection

Angular 20 cho phép bỏ hoàn toàn Zone.js, sử dụng Signals để tự động phát hiện thay đổi. Giảm bundle size, improve performance.

### Signal Diagnostics

Công cụ debug mới giúp developer hiểu tại sao signal không cập nhật, component không re-render.

### Template Type Checking

Improved strictness cho template types, bắt lỗi sớm hơn khi build.

### angular.dev

Documentation site mới thay thế angular.io, tích hợp tutorial interactive và code playground.

### angular.dev CLI

CLI tools mới hỗ trợ generate, migrate, và analyze Angular projects.