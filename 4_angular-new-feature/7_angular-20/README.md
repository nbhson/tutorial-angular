# Angular 20 New Features

Tổng hợp các feature mới trong Angular 20. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### I. New Features in Templates & Routing

Angular 20 đẩy mạnh power cho template layer và upgrade routing system:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [`@let` in Templates](1_new-featue/1_new-feature-in-template/) | Khai báo biến cục bộ trong template |
| 2 | [Async Redirect Function](1_new-featue/2_asynchronous-redirect-function/) | `redirectTo` hỗ trợ async function |
| 3 | [Abort Redirection](1_new-featue/3_abort-redirection/) | Huỷ bỏ navigation đang chạy |
| 4 | [`ngComponentOutlet`](1_new-featue/4_ng-component-outlet-DYNAMIC-COMPONENT/) | Dynamic components đơn giản hơn |
| 5 | [`Injector.destroy()`](1_new-featue/5_injector-destroy/) | Huỷ bỏ injector và dependencies |
| 6 | [Keepalive Fetch Requests](1_new-featue/6_keepalive-fetch-requests/) | Giữ fetch requests qua navigation |
| 7 | [ScrollOptions ViewportScroller](1_new-featue/7_viewportscroller-scrolloptions/) | Tùy chỉnh scroll position khi navigate |

### II. Developer Experience

Cải thiện lớn cho developer workflow và debugging:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Zoneless Change Detection](2_developer-experience/1_zoneless-change-detection/) | Signal-based rendering, bỏ Zone.js |
| 2 | [Signal Diagnostics](2_developer-experience/2_signal-diagnostics/) | Debug signals dễ dàng hơn |
| 3 | [Template Type Checking](2_developer-experience/3_template-type-checking/) | Kiểm tra types trong template chính xác hơn |
| 4 | [angular.dev](2_developer-experience/4_angular-dev/) | Documentation site mới |
| 5 | [angular.dev CLI](2_developer-experience/5_angular-dev-cli/) | CLI tools mới |

### III. API Stability Changes

Các API đã chuyển từ Developer Preview sang Stable:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Signal Inputs Stable](3_api-stability-changes/1_signal-inputs-stable/) | `input()` signals API chính thức stable |
| 2 | [Model Inputs Stable](3_api-stability-changes/2_model-inputs-stable/) | `model()` two-way binding stable |
| 3 | [Linked Signals Stable](3_api-stability-changes/3_linked-signals-stable/) | `linkedSignal()` chính thức stable |
| 4 | [Resource API](3_api-stability-changes/4_resource-api/) | `resource()` async data loading mới |
| 5 | [HttpResource](3_api-stability-changes/5_http-resource/) | `httpResource()` tích hợp HTTP client |
| 6 | [Content Projection với ng-slot](3_api-stability-changes/6_content-projection-ng-slot/) | `ng-slot` thay thế `ng-content` |
| 7 | [CSS Native Encapsulation](3_api-stability-changes/7_css-native-encapsulation/) | `encapsulation: 'none'` dùng native CSS |

## VI. ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Template compiler mạnh hơn nhiều** – Template literals, `in`, `void`, `**` đưa template gần hơn với TypeScript
2. **Signal APIs finally stable** – Đủ tự tin để dùng production
3. **Zoneless đang tiến gần** – Developer preview là bước quan trọng
4. **Diagnostics thông minh hơn** – Giúp bắt lỗi sớm, đặc biệt khi migrate
5. **Dynamic components dễ dùng hơn** – NgComponentOutlet mới giảm boilerplate đáng kể

### Điểm cần lưu ý:

1. **Breaking changes đáng kể** – Node 18 bị drop, ng-reflect bị xóa
2. **Signal Forms & Selectorless Components vẫn chưa có** – Đây là 2 tính năng được chờ đợi nhất
3. **Zoneless chưa stable** – Cần test kỹ trước khi migrate

### Lời khuyên:

- Nên upgrade sớm để tận dụng template features mới và stable Signal APIs
- Kiểm tra test suite vì ng-reflect removal có thể gây test failures
- Bắt đầu thử zoneless trên project mới hoặc non-critical features
- Theo dõi Angular 21 cho Signal Forms và Selectorless Components

## Yêu cầu

- Angular 20+
- Node.js 18+

## Chạy thử

```bash
cd 1_new-featue/1_new-feature-in-template  # Hoặc project khác
npm install
ng serve