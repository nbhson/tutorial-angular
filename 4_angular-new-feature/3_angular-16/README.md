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
- Node.js v16 hoặc v18
- TypeScript >= 4.9.3 và < 5.2.0 (TS < 5.0 chưa hỗ trợ decorators chuẩn mới; Angular 16 chưa hỗ trợ TS >= 5.2)

## Breaking changes cần lưu ý khi nâng cấp lên v16

- **Xóa ngcc và View Engine:** Angular 16 xóa hoàn toàn `ngcc` (Angular compatibility compiler) và View Engine. Mọi library phải ở định dạng Ivy (partial-Ivy). Nếu còn dependency dùng View Engine thì phải nâng cấp library trước.
- **Xóa `ReflectiveInjector`:** đã bị xóa khỏi `@angular/core`. Dùng `Injector.create()` thay thế.
- **`TransferState` / `makeStateKey` chuyển package:** chuyển từ `@angular/platform-browser` sang `@angular/core` (import cũ vẫn tương thích ngược nhưng nên đổi sang `@angular/core`).

## Các nhóm feature mới trong v16 (bổ sung ngoài 3 demo chính)

- **RxJS interop (developer preview):** `toSignal()` / `toObservable()` trong `@angular/core/rxjs-interop` giúp chuyển đổi Observable ↔ Signal; `takeUntilDestroyed()` hủy subscription tự động theo `DestroyRef`.
- **Standalone tooling:** `ng new --standalone` tạo app standalone mặc định; schematic migration `ng generate @angular/core:standalone` chuyển NgModule/component/pipe cũ sang standalone.
- **esbuild + Vite (developer preview):** builder `browser-esbuild` cho production build nhanh hơn; dev-server dùng Vite. Mức cải thiện build nhanh hơn đáng kể (con số 72% chỉ đo trên cold production builds minh họa, không phải mọi project).
- **Jest support (experimental):** builder `@angular-devkit/build-angular:jest` thử nghiệm, thay thế Karma/Jasmine.
- **Router:** chuyển sang `bootstrapApplication` + `provideRouter()` dạng functional là cách mặc định cho standalone; bật binding router data sang component input bằng `provideRouter(routes, withComponentInputBinding())`.

Nguồn official:
- https://v16.angular.io/guide/update-to-version-16
- https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d
- https://angular.dev/guide/signals
- https://angular.dev/guide/rxjs-interop
- https://angular.dev/guide/ssr
- https://angular.dev/guide/hydration

## Chạy thử

```bash
cd 1-angular-signals  # Hoặc project khác
npm install
ng serve