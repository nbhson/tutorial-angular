# Angular 16 New Features

Tổng hợp các feature mới trong Angular 16. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### Signals & State Management

Angular 16 giới thiệu Signals – paradigm mới cho reactivity:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Angular Signals](1-angular-signals/README.md) | Reactive primitives mới |
| 2 | [Signals - Small Example](1.1-angular-signals-small-example/README.md) | Ví dụ nhỏ về signals usage |
| 3 | [Signals - State Management](1.2-angular-signals-state-management/README.md) | Dùng signals quản lý state |

### SSR & Developer Experience

| # | Feature | Mô tả |
|---|---------|-------|
| 4 | [SSR and Hydration](2-ssr-and-hydration/README.md) | Server-side rendering improved |
| 5 | [Developer Experience Improvements](3-four-improving-developer-experience/README.md) | 4 cải thiện DX |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Signals** – Paradigm mới, efficient reactivity không cần RxJS cho simple cases
2. **SSR & Hydration** – Performance improvements lớn cho server-rendered apps
3. **Developer Experience** – Nhiều cải thiện nhỏ nhưng ý nghĩa

### Điểm cần lưu ý:

1. **Signals vẫn developer preview** – Chưa stable trong Angular 16
2. **SSR configuration phức tạp** – Cần setup đúng cách

### Lời khuyên:

- Bắt đầu học Signals nhưng chưa dùng production
- Nâng cấp SSR nếu đang dùng server-side rendering
- Tham gia community discussions về Signals best practices

## Yêu cầu

- Angular 16+
- Node.js 16+

## Chạy thử

```bash
cd 1-angular-signals  # Hoặc project khác
npm install
ng serve