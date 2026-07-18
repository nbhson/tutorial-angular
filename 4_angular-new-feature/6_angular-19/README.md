# Angular 19 New Features

Tổng hợp các feature mới trong Angular 19. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### I. Signals & Reactivity

Angular 19 đẩy mạnh Signal-based architecture với các API mới:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [linkedSignal](1_linkedSignal/README.md) | Writable signal tự động reset khi source thay đổi |
| 2 | [Resource API](2_api-resource/README.md) | Async data loading primitives với Signal |
| 3 | [updateEffect](3_update-effect/README.md) | Loại bỏ `allowSignalWrites` flag, thay đổi timing |
| 4 | [RxJS Interop](4_rxjs-interop/README.md) | Custom equality function cho `toSignal()` |

### II. Lifecycle & Templates

Cải thiện mới cho component lifecycle và template syntax:

| # | Feature | Mô tả |
|---|---------|-------|
| 5 | [afterRenderEffect](5_after-render-effect/README.md) | Lifecycle hook kết hợp render + effect — chỉ chạy khi dependency thay đổi |
| 6 | [`@let` Variable](6_new-let-variable/README.md) | Khai báo biến cục bộ trong template (stable từ v19) |

### III. Router & Dependency Injection

Nâng cấp hệ thống routing và DI:

| # | Feature | Mô tả |
|---|---------|-------|
| 7 | [Router Outlet Data](7_router-outlet-data/README.md) | `[routerOutletData]` input — truyền Signal data từ parent xuống routed child |
| 8 | [Query Param Handling](8_query-param-handling/README.md) | Default query params strategy qua `withRouterConfig()` |
| 9 | [Initializer Provider Function](9_initialer-provider-function/README.md) | `provideAppInitializer()` thay thế `APP_INITIALIZER` token |

### IV. Developer Experience & Diagnostics

Cải thiện lớn cho developer workflow và build performance:

| # | Feature | Mô tả |
|---|---------|-------|
| 10 | [Angular Diagnostics](10_new-angular-diagnostics/README.md) | Extended diagnostics — detect unused standalone imports |
| 11 | [TypeScript Isolated Modules](10_typescript-isolated-modules/README.md) | Bật `isolatedModules` để transpile qua esbuild, boost 10% build time |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **linkedSignal** — Gap giữa signal và computed được lấp đầy, writable + reactive
2. **Resource API** — Async data loading standardized với abort signal, loading state built-in
3. **`@let` in templates** — Template variables trở nên clean hơn, không cần workaround
4. **Router Outlet Data** — Data passing linh hoạt hơn giữa parent ↔ routed child
5. **Angular Diagnostics** — Compiler giúp bắt lỗi sớm, giảm bundle size
6. **Effect improvements** — `allowSignalWrites` bỏ đi, timing predict hơn
7. **Isolated Modules** — Build time giảm ~10% với esbuild transpilation

### Điểm cần lưu ý:

1. **Resource API vẫn Developer Preview** — Chưa stable, API có thể thay đổi
2. **`afterRenderEffect()` vẫn Developer Preview** — Chưa nên dùng production
3. **Nhiều breaking changes từ v18** — Kiểm tra migration guide kỹ
4. **Isolated Modules** có thể gây type errors nếu project dùng `const enum` hoặc re-export type
5. **Default query params** là `replace`, không phải `preserve` — dễ gây surprise

### Lời khuyên:

- **linkedSignal**: Bắt đầu dùng cho derived state cần override (form selections, UI state)
- **`@let`**: Thay thế `*ngIf="... as x"` pattern ngay lập tức
- **Resource API**: Thử nghiệm trên project mới, kết hợp với `httpResource` (v20)
- **Router Outlet Data**: Dùng thay shared service cho parent → routed child communication
- **isolatedModules**: Enable ngay — đảm bảo `useDefineForClassFields: true`
- **Diagnostics**: Bật `warning` trước, rồi upgrade lên `error` khi đã clean code
- **effect()**: An toàn hơn để ghi signal trong effect — tận dụng timing mới
- **Initializer providers**: Migrate từ `APP_INITIALIZER` token sang `provideAppInitializer()`

## Tính năng quan trọng khác trong Angular 19

| Feature | Mô tả |
|---------|-------|
| **Signal Inputs** | `input()` API tiếp tục được cải thiện |
| **Model Inputs** | `model()` two-way binding cho child components |
| **Standalone by default** | Components mới là standalone theo mặc định |
| **Dependency injection** | `input()` và `model()` tích hợp DI |
| **Zoneless improvements** | Zoneless mode tiếp tục được refinement |

## Yêu cầu

- Angular 19+
- Node.js 18+

## Chạy thử

```bash
cd 1_linkedSignal  # Hoặc project khác
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular 19 Release Blog](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)
- [What's New in Angular 19](https://angular.love/angular-19-whats-new)
- [Angular 19 Update Guide](https://angular.dev/update-guide)
- [Angular Official Documentation](https://angular.dev)