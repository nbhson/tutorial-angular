# Tutorial Angular (framework v14 → v22)

Bộ tutorial Angular đầy đủ bằng tiếng Việt, đi kèm bộ `tutorial-react` đối chiếu 1-1. Repo cập nhật dần theo Angular v22 (standalone mặc định, Signals, zoneless, Vitest).

> ⚠️ **Cảnh báo quan trọng — Section 1 (`1_angularjs-tutorial`)**: nội dung về **AngularJS 1.x** (framework đã **EOL** từ 01/2022, Google ngừng bảo mật). Chỉ đọc để hiểu lịch sử và để ánh xạ khái niệm cũ → mới. **KHÔNG dùng cho project mới.** Project mới hãy dùng Angular hiện đại (v17+) từ Section 3.

## Bản đồ tổng thể

| Folder | Nội dung | Dành cho ai |
|---|---|---|
| `1_angularjs-tutorial` | AngularJS 1.x (EOL): expression, directive, filter, service, routing, unit-test bower/karma | Đọc để hiểu lịch sử, ánh xạ `$scope`/`ng-repeat` → modern |
| `2_angular-techniques` (8 nhóm) | advanced-features, architecture-patterns, performance-optimization, security-config, micro-frontend, dev-tools, build-with-ai, best-practices | Dev đã nắm cơ bản, cần kỹ thuật nâng cao |
| `3_angular-tutorial` (Day 0..21) | **Giáo trình chính cho người mới**: data binding, directive, DI, pipe, form, HTTP, module, router, lifecycle, service, Material, i18n, animation, testing | Người mới bắt đầu Angular |
| `4_angular-new-feature` (v14..v22) | Mỗi version một folder: feature mới của Angular 14 → 22 | Dev cần cập nhật kiến thức phiên bản |

## Timeline kiến thức (Angular v14 → v22)

| Version | Mốc | Feature nổi bật |
|---|---|---|
| v14 | 06/2022 | Standalone components (preview), Typed Forms, `inject()`, `RouteTitle` |
| v15 | 11/2022 | Standalone stable, Directive Composition API, `NgOptimizedImage`, functional router guards, stack traces rõ hơn |
| v16 | 05/2023 | **Signals** (preview), SSR + Hydration, required inputs, cải thiện DX lớn |
| v17 | 11/2023 | **Built-in control flow** `@if`/`@for`/`@switch`, deferrable views, Vite + esbuild mặc định, View Transitions (experimental) |
| v18 | 05/2024 | Zoneless (experimental), route redirect as function, fallback content `ng-content`, form control state mới |
| v19 | 11/2024 | `linkedSignal`, `resource()` API, `@let`, `afterRenderEffect`, rxjs-interop, standalone mặc định, incremental hydration |
| v20 | 05/2025 | Ổn định hóa zoneless, API naming mới, cải thiện diagnostics, DX |
| v21 | 11/2025 | **Signal Forms**, **zoneless mặc định**, **Vitest mặc định** (thay Karma/Jasmine), Angular Aria, `HttpClient` dùng `fetch` backend |
| v22 | 2026 | **`OnPush` mặc định**, Signal Forms stable, `resource()`/`httpResource()` stable, compiler type-safety, router input binding mở rộng |

## Mục lục chi tiết

### Section 3 — `3_angular-tutorial` (giáo trình chính)

| Day | Folder | Chủ đề |
|---|---|---|
| 0 | [0-angular-explore](3_angular-tutorial/0-angular-explore) | Làm quen project Angular CLI |
| 1 | [1-angular-data-binding](3_angular-tutorial/1-angular-data-binding) | Data binding: interpolation, property, event, two-way |
| 2 | [2-angular-directive](3_angular-tutorial/2-angular-directive) | Directive: structural `*ngIf`/`*ngFor`, attribute |
| 3 | [3-angular-interaction](3_angular-tutorial/3-angular-interaction) | Interaction giữa các component (`@Input`/`@Output`) |
| 4 | [4-angular-template-reference-variable](3_angular-tutorial/4-angular-template-reference-variable) | Template reference variable (`#ref`) |
| 5 | [5-angular-ng-content](3_angular-tutorial/5-angular-ng-content) | Content projection với `ng-content` |
| 6 | [6-angular-ng-template-ng-container-ng-template-outle](3_angular-tutorial/6-angular-ng-template-ng-container-ng-template-outle) | `ng-template`, `ng-container`, `ngTemplateOutlet` |
| 7 | [7-angular-dependency-injection-basic](3_angular-tutorial/7-angular-dependency-injection-basic) | Dependency Injection cơ bản |
| 8 | [8-angular-use-dependency-injection](3_angular-tutorial/8-angular-use-dependency-injection) | DI thực chiến: token, provider scope |
| 9 | [9-angular-content-child-contend-children](3_angular-tutorial/9-angular-content-child-contend-children) | `@ContentChild` / `@ContentChildren` |
| 10 | [10-angular-pipe](3_angular-tutorial/10-angular-pipe) | Pipe: built-in và custom |
| 11 | [11-angular-form](3_angular-tutorial/11-angular-form) | Form: Reactive Forms + validation |
| 12 | [12-angular-http-client](3_angular-tutorial/12-angular-http-client) | `HttpClient` + `resource()`/`httpResource()` |
| 13 | [13-angular-module](3_angular-tutorial/13-angular-module) | NgModule vs standalone |
| 14 | [14-angular-router](3_angular-tutorial/14-angular-router) | Router: route, guard, lazy loading |
| 15 | [15-angular-lifecycle](3_angular-tutorial/15-angular-lifecycle) | Component lifecycle hooks |
| 16 | [16-angular-service](3_angular-tutorial/16-angular-service) | Service + state với Signals |
| 17 | [17-angular-material](3_angular-tutorial/17-angular-material) | Angular Material + theming |
| 18 | [18-angular-i18n](3_angular-tutorial/18-angular-i18n) | Internationalization (i18n) |
| 19 | [19-angular-animations](3_angular-tutorial/19-angular-animations) | Animation API |
| 20 | [20-angular-drag-drop](3_angular-tutorial/20-angular-drag-drop) | Drag & Drop với Angular CDK |
| 21 | [21-angular-testing-e2e](3_angular-tutorial/21-angular-testing-e2e) | Unit test (Vitest) + E2E (Playwright) |

### Section 4 — `4_angular-new-feature` (v14 → v22)

| Version | Folder | Feature chính |
|---|---|---|
| v14 | [1_angular-14](4_angular-new-feature/1_angular-14) | Standalone, Typed Forms, `inject()` |
| v15 | [2_angular-15](4_angular-new-feature/2_angular-15) | Standalone stable, `NgOptimizedImage`, functional guards |
| v16 | [3_angular-16](4_angular-new-feature/3_angular-16) | Signals, SSR + Hydration |
| v17 | [4_angular-17](4_angular-new-feature/4_angular-17) | Control flow `@if`/`@for`, hydration, Vite+esbuild |
| v18 | [5_angular-18](4_angular-new-feature/5_angular-18) | Zoneless, redirect as function, form control state |
| v19 | [6_angular-19](4_angular-new-feature/6_angular-19) | `linkedSignal`, `resource()`, `@let`, rxjs-interop |
| v20 | [7_angular-20](4_angular-new-feature/7_angular-20) | Feature mới trong template, injector, DX |
| v21 | [8_angular-21](4_angular-new-feature/8_angular-21) | Signal Forms, zoneless mặc định, Vitest mặc định |
| v22 | [9_angular-22](4_angular-new-feature/9_angular-22) | `OnPush` mặc định, `httpResource()` stable, type-safety |

## Stack chuẩn trong tutorial

- **CLI**: Angular CLI mới nhất (`ng new`, `ng generate`, `ng update`).
- **Kiến trúc**: standalone components (không cần NgModules), `provideRouter`/`provideHttpClient` trong `app.config.ts`.
- **State**: Signals (`signal`, `computed`, `effect`, `linkedSignal`, `resource`), RxJS cho luồng async phức tạp.
- **Form**: Reactive Forms; Signal Forms cho app mới (v21+).
- **UI**: Angular Material / Tailwind CSS.
- **Test**: Vitest (unit, mặc định từ v21) + Playwright (E2E). Karma/Jasmine chỉ còn trong repo cũ để đối chiếu.

## Quy ước mỗi bài học

- `README.md` tiếng Việt, xưng hô "bạn", cấu trúc thống nhất: **Mục tiêu → Khái niệm → Code mẫu (comment tiếng Việt không dấu) → So sánh Angular ↔ React → Lỗi thường gặp → Best practices → Bài tập → Reference**.
- Mỗi bài trong `3_angular-tutorial` kèm project Angular CLI chạy được (`ng serve`).
- Nội dung legacy (AngularJS 1.x, Karma, NgModule) được ghi rõ để tránh nhầm lẫn.
- Comment trong code viết tiếng Việt **không dấu** để tránh lỗi encoding trên các editor/máy cũ.

## Lộ trình đọc gợi ý

- **Người mới (biết TypeScript/JS)**: `3_angular-tutorial` Day 0 → 1 → 2 → 7 → 8 → 10 → 11 → 12 → 14 → 15 → 16 → 21.
- **Đến từ AngularJS 1.x**: đọc nhanh `1_angularjs-tutorial` để đối chiếu (controller → component, scope → signals) rồi chuyển hẳn sang `3_angular-tutorial`.
- **Đến từ React**: đọc `3_angular-tutorial` song song với `tutorial-react` (mỗi bài có bảng So sánh Angular ↔ React).
- **Cập nhật version**: `4_angular-new-feature` đọc tuần tự `1_angular-14` → `9_angular-22`.
- **Đi sâu kỹ thuật**: `2_angular-techniques` theo nhóm nhu cầu (performance, architecture, security, micro-frontend...).

## Bắt đầu nhanh

```bash
# Cài Angular CLI
npm install -g @angular/cli

# Tạo app mới (standalone, TypeScript strict)
ng new my-app
cd my-app && ng serve

# Chạy một lesson trong repo
cd 3_angular-tutorial/0-angular-explore
npm install && ng serve
```

## Reference chính

- [Angular.dev — docs chính thức](https://angular.dev)
- [Signals overview](https://angular.dev/guide/signals)
- [Signal Forms](https://angular.dev/guide/forms/signals)
- [HTTP Client](https://angular.dev/guide/http)
- [Router](https://angular.dev/guide/routing)
- [Testing](https://angular.dev/guide/testing)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Blog Angular — release notes từng version](https://blog.angular.dev)
