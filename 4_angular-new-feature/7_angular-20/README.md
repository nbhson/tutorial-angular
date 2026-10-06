# Angular 20 New Features (20.0.0 — 28/05/2025)

Tổng hợp các feature mới trong Angular 20. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

> Nguồn chính: https://blog.angular.dev/announcing-angular-v20-b5c9c06cf301,
> https://github.com/angular/angular/releases/tag/20.0.0
>
> Lưu ý version (đã hiệu chỉnh):
> - `input()` / `signal()` / `computed()` đã stable **trước v20** (v17–v19).
>   Batch stable **trong v20** là `effect` (stable), `linkedSignal` (#60741/#60865),
>   `toSignal` (#60442), `toObservable` (#60449).
> - `resource()` / `httpResource()` trong v20 vẫn là **experimental**
>   (stable từ v22 — xem https://angular.dev/api/common/http/httpResource).
> - `Signal Forms` là v21, `Selectorless` là v21 (không phải v20). Không liệt kê ở đây.
> - Không có `ng-slot`. Docs chính thức vẫn là `ng-content` + fallback.
> - `ViewEncapsulation.None/Emulated/ShadowDom` có từ lâu. Mới quanh v20 là
>   `IsolatedShadowDom` (experimental). `encapsulation: 'none'` KHÔNG phải native CSS mới.

## Tổng quan theo nhóm

### I. New Features in Templates & Routing

Angular 20 đẩy mạnh power cho template layer và upgrade routing system:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [`@let` in Templates](1_new-featue/1_new-feature-in-template/) | Khai báo biến cục bộ — ra mắt **v18.1**, KHÔNG phải v20 (nhắc lại để dùng đúng) |
| 2 | [Async Redirect Function](1_new-featue/2_asynchronous-redirect-function/) | `redirectTo`/`RedirectFn` hỗ trợ async (`Promise`\|`Observable`) — mới v20 (#60863); sync function có từ trước |
| 3 | [Abort Redirection](1_new-featue/3_abort-redirection/) | `Navigation.abort()` — mới v20 (#60380). KHÔNG có `.aborted` |
| 4 | [`ngComponentOutlet`](1_new-featue/4_ng-component-outlet-DYNAMIC-COMPONENT/) | **Pre-existing (v14–v16)** — KHÔNG phải mới v20; v20 chỉ polish (input binding #60137, two-way #60342, outputs #60137) |
| 5 | [`Injector.destroy()`](1_new-featue/5_injector-destroy/) | Mới v20 (#60054, `DestroyableInjector`) — xem https://angular.dev/api/core/Injector |
| 6 | [Keepalive Fetch Requests](1_new-featue/6_keepalive-fetch-requests/) | `keepalive` là **flag native fetch per-request** (#60621): `http.get(url, { keepalive: true })` + `withFetch()`. KHÔNG có `withKeepalive()` |
| 7 | [ScrollOptions ViewportScroller](1_new-featue/7_viewportscroller-scrolloptions/) | Đúng là `withInMemoryScrolling(options: InMemoryScrollingOptions)` + `ViewportScroller.scrollToPosition/scrollToAnchor(pos, ScrollOptions)` (#61002). KHÔNG có `withViewPortScroller({...scrollOffset})` |

### II. Developer Experience

Cải thiện lớn cho developer workflow và debugging:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Zoneless Change Detection](2_developer-experience/1_zoneless-change-detection/) | `provideZonelessChangeDetection()` — v20 là **Developer Preview** (+`provideBrowserGlobalErrorListeners` #60704); stable 20.2, default 21 |
| 2 | [Signal Diagnostics](2_developer-experience/2_signal-diagnostics/) | KHÔNG có `.debug` public API — feature thật là DevTools signals + `provideCheckNoChangesConfig()` (#60906) |
| 3 | [Template Type Checking](2_developer-experience/3_template-type-checking/) | `strictTemplates` có từ **v9** — mới trong v20 chỉ là host-bindings polish (#60267) + extended diagnostics (#60495/#60279/#59443) |
| 4 | [angular.dev](2_developer-experience/4_angular-dev/) | Launch từ **v17–v18**, KHÔNG phải v20 — chỉ nhắc lại |
| 5 | [angular.dev CLI](2_developer-experience/5_angular-dev-cli/) | KHÔNG có `ng analyze` / `ng performance` — CLI thật v20: schematic `--zoneless`, template HMR default, `ng update`, `TestBed.tick()` |

### III. API Stability Changes

Batch **stable trong v20** là `effect`, `linkedSignal` (#60741/#60865),
`toSignal` (#60442), `toObservable` (#60449).
`input()` / `signal()` / `computed()` / `model()` đã stable **trước v20** (v17–v19) — chỉ nhắc lại.
`resource()` / `httpResource()` trong v20 vẫn là **experimental** (stable từ v22).

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Signal Inputs Stable](3_api-stability-changes/1_signal-inputs-stable/) | `input()` đã stable **trước v20** — nhắc lại, không phải mới v20 |
| 2 | [Model Inputs Stable](3_api-stability-changes/2_model-inputs-stable/) | `model()` đã stable **trước v20** — nhắc lại, không phải mới v20 |
| 3 | [Linked Signals Stable](3_api-stability-changes/3_linked-signals-stable/) | `linkedSignal()` chính thức stable **trong v20** (#60741/#60865) |
| 4 | [Resource API](3_api-stability-changes/4_resource-api/) | `resource()` **experimental trong v20** (stable v22) — `params` + `loader`, không phải `request/query` |
| 5 | [HttpResource](3_api-stability-changes/5_http-resource/) | `httpResource()` **experimental trong v20** — `request` bắt buộc là reactive function, `parse` (không phải `map`) |
| 6 | [Content Projection với ng-slot](3_api-stability-changes/6_content-projection-ng-slot/) | ⚠️ **INVENTED — KHÔNG tồn tại**: không có `ng-slot`. Docs chính thức vẫn là `ng-content` + fallback |
| 7 | [CSS Native Encapsulation](3_api-stability-changes/7_css-native-encapsulation/) | Mới quanh v20 là `IsolatedShadowDom` (experimental). `ViewEncapsulation.None/Emulated/ShadowDom` có từ lâu |

## IV. Ổn định khác trong v20 (bổ sung cho đúng release notes)

- **Incremental hydration + route-level render mode stable** (SSR).
- **Breaking:** `afterRender` → `afterEveryRender` (đổi tên).
- `provideBrowserGlobalErrorListeners()` (#60704, đi cùng zoneless preview).
- Template: **untagged literals**, `in` operator polish.
- **Template HMR default**, schematic `--zoneless`.
- **Breaking yêu cầu môi trường:** Node `>=20.11.1` (drop Node 18), TypeScript, `TestBed` (xem release notes), xóa `ng-reflect` khỏi DOM test.

## VI. ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Template compiler mạnh hơn nhiều** – Template literals, `in`, `void`, `**` đưa template gần hơn với TypeScript
2. **Signal APIs finally stable** – Đủ tự tin để dùng production
3. **Zoneless đang tiến gần** – Developer preview là bước quan trọng
4. **Diagnostics thông minh hơn** – Giúp bắt lỗi sớm, đặc biệt khi migrate
5. **Dynamic components dễ dùng hơn** – NgComponentOutlet mới giảm boilerplate đáng kể

### Điểm cần lưu ý:

1. **Breaking changes đáng kể** – Node 18 bị drop (>=20.11.1), ng-reflect bị xóa, `afterRender` → `afterEveryRender`
2. **Zoneless mới chỉ Developer Preview trong v20** (stable 20.2, default 21) – cần test kỹ trước khi migrate
3. **`resource()` / `httpResource()` vẫn experimental trong v20** (stable v22)

### Lời khuyên:

- Nên upgrade sớm để tận dụng template features mới và batch Signal APIs stable trong v20 (`effect`, `linkedSignal`, `toSignal`/`toObservable`)
- Kiểm tra test suite vì ng-reflect removal + TestBed breaking có thể gây test failures
- Bắt đầu thử zoneless trên project mới hoặc non-critical features
- Không dùng `ng-slot` / `withKeepalive()` / `ng analyze` / `ng performance` / `encapsulation: 'none'` như "mới v20" — đều là nội dung invented đã được đánh dấu trong từng folder

## Yêu cầu

- Angular 20+
- Node.js >=20.11.1 (drop Node 18)

## Chạy thử

```bash
cd 1_new-featue/1_new-feature-in-template  # Hoặc project khác
npm install
ng serve