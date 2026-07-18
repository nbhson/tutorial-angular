# Angular 14 New Features

Tổng hợp các feature mới trong Angular 14. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### Core & Forms

Angular 14 tập trung mạnh vào Type Safety cho Forms:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Standalone Components](1_standalone-components/README.md) | Component độc lập không cần NgModule |
| 2 | [Typed Forms](2_typed-form/README.md) | FormGroup, FormControl, FormArray có type-safe |

### Dependency Injection & Routing

| # | Feature | Mô tả |
|---|---------|-------|
| 3 | [`inject()` Function](3_inject/README.md) | Inject dependencies ngoài constructor |
| 4 | [Title on Router](4_title-on-router/README.md) | Set page title trong route config |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Typed Forms** – Loại bỏ runtime type errors trong forms
2. **Standalone Components** – Bước đầu tiên bỏ NgModule, code gọn hơn
3. **`inject()` function** – Alternative mới cho constructor injection

### Điểm cần lưu ý:

1. **Standalone vẫn experimental** – Chưa stable trong Angular 14
2. **Typed Forms có breaking changes** – Cần migrate từ UntypedForms

### Lời khuyên:

- Bắt đầu migrate forms sang Typed Forms trên project mới
- Thử Standalone Components cho components mới
- Dùng `inject()` function cho cleaner dependency injection

## Yêu cầu

- Angular 14+
- Node.js 16+

## Chạy thử

```bash
cd 1_standalone-components  # Hoặc project khác
npm install
ng serve