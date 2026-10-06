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
| 10 | [TypeScript Isolated Modules](10_typescript-isolated-modules/README.md) | Bật `isolatedModules` để transpile qua esbuild, boost 10% build time (có từ v18.2, không phải new v19) |
| 11 | [Angular Diagnostics](10_new-angular-diagnostics/README.md) | Extended diagnostics — detect unused standalone imports |

> Ghi chú: hiện có 2 folder đều đánh số `10_` (`10_typescript-isolated-modules` + `10_new-angular-diagnostics`). Đúng ra nên là `10_` + `11_` để tránh trùng số thứ tự.

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

| Feature | Mô tả | Ghi chú version |
|---------|-------|-----------------|
| **Standalone by default** | Components/directives/pipes mới sinh ra là standalone theo mặc định (`standalone: true` ngầm định) | ✅ Mới trong v19 |
| **Signal Inputs** | `input()` API tiếp tục được cải thiện | Có từ v17.1, không phải new v19 |
| **Model Inputs** | `model()` two-way binding cho child components | Có từ v17.2, không phải new v19 |
| **Zoneless improvements** | Zoneless mode tiếp tục được refinement (experimental) | Có từ v18, cải tiến dần ở v19 |
| **Incremental Hydration** | `withIncrementalHydration()` + `@defer (hydrate ...)` — hydrate từng phần thay vì toàn page | ✅ Mới trong v19 |
| **HMR kiểu mới** | Template HMR (hot swap template không cần refresh, hoàn thiện ở v19.1) | ✅ Mới v19/v19.1 |
| **`rxResource()` / `httpResource()`** | Resource chuyên cho Observable / HttpClient (`httpResource` stable từ v20) | ✅ Mới v19 (experimental) |
| **`strictStandalone` + `standalone default`** | Schematic `standalone-migration`, compiler flag `strictStandalone` | ✅ Mới v19 |
| **SSR `RenderMode` per-route** | `ServerRoute` — cấu hình `RenderMode.Prerender/Server/Client` cho từng route | ✅ Mới v19 |
| **`RouterLink` nhận `UrlTree`** | `[routerLink]` bind trực tiếp `UrlTree` thay vì chỉ string/array | ✅ Mới v19 |

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
- [linkedSignal API](https://angular.dev/api/core/linkedSignal)
- [Resource API Guide](https://angular.dev/guide/signals/resource)
- [What's New in Angular 19](https://angular.love/angular-19-whats-new)
- [Angular 19 Update Guide](https://angular.dev/update-guide)
- [Angular Official Documentation](https://angular.dev)