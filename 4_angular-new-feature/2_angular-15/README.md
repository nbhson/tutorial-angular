# Angular 15 New Features

Tổng hợp các feature mới trong Angular 15. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### Standalone & Components

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Standalone APIs Stable](1_standalone-stable/README.md) | Standalone components official stable |
| 2 | [Directive Composition API](2_directive-composition-api/README.md) | Kết hợp multiple directives trên một component |
| 3 | [Image Directive](3-image-directive/README.md) | `NgOptimizedImage` directive mới |

### Build & Performance

| # | Feature | Mô tả |
|---|---------|-------|
| 4 | [Image Directive - Advanced](3.1-image-directive/README.md) | Deep dive image optimization |
| 5 | [esBuild Improvements](4-improvements_esbuild/README.md) | Cải thiện build với esBuild |

### Router & DX

| # | Feature | Mô tả |
|---|---------|-------|
| 6 | [Functional Router Guards](5_functional-router-guards/README.md) | Guards bằng functions thay vì classes |
| 7 | [Auto Import in Language Service](6_automatic-import-in-language-service/README.md) | Auto import khi viết code |
| 8 | [Better Stack Traces](7-better_stack_traces/README.md) | Stack traces rõ ràng hơn |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Standalone APIs stable** – Đủ tự tin dùng production
2. **Directive Composition API** – Cách mới để reuse logic
3. **Functional Router Guards** – Code gọn hơn, modern hơn
4. **NgOptimizedImage** – Tối ưu image loading dễ dàng
5. **Better DX** – Auto import, better stack traces

### Điểm cần lưu ý:

1. **esBuild mới experimental** – Chưa default cho mọi project
2. **Breaking changes từ standalone migration** – Cần test kỹ

### Lời khuyên:

- Chuyển sang functional router guards cho các project mới
- Sử dụng NgOptimizedImage cho tất cả images
- Bắt đầu migrate sang standalone components

## Yêu cầu

- Angular 15+
- Node.js 16+

## Chạy thử

```bash
cd 1_standalone-stable  # Hoặc project khác
npm install
ng serve