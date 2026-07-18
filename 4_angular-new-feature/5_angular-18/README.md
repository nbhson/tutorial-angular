# Angular 18 New Features

Tổng hợp các feature mới trong Angular 18. Mỗi folder chứa một demo project minh họa cho feature cụ thể.

## Tổng quan theo nhóm

### I. Rendering & Routing

Angular 18 có những cập nhật quan trọng về change detection và routing:

| # | Feature | Mô tả |
|---|---------|-------|
| 1 | [Zoneless Change Detection](1_zoneless/README.md) | Experimental zoneless mode — chạy Angular không cần zone.js |
| 2 | [Route Redirect as Function](2_route-redirect-as-fucntion/README.md) | `redirectTo` hỗ trợ functions — redirect linh hoạt dựa trên runtime conditions |

### II. Templates & Forms

Cải thiện cho content projection và form management:

| # | Feature | Mô tả |
|---|---------|-------|
| 3 | [Fallback Content for ng-content](3_fallback-content-for-ng-content/README.md) | Default content cho content projection trong ng-content |
| 4 | [Form Control State Change Events](4_form-new-control-state/README.md) | Property `events` mới trên FormControl — unified event stream |

## ĐÁNH GIÁ TỔNG QUAN

### Điểm mạnh:

1. **Zoneless mode** — Bước tiến lớn hướng tới signal-based reactivity, loại bỏ overhead của zone.js
2. **Route redirect functions** — Flexible routing logic hơn, có thể inject services và xử lý errors
3. **Fallback content** — Content projection dễ dùng hơn, giảm boilerplate code
4. **Form control state events** — Unified event stream để theo dõi value và status changes

### Điểm cần lưu ý:

1. **Zoneless vẫn experimental** — Chưa nên dùng production, cần test kỹ
2. **Form control events API có thể thay đổi** — API mới, chưa stable
3. **Dynamic route redirect function** — Cần cân nhắc khi dùng quá phức tạp, có thể gây confusion

### Lời khuyên:

- **Zoneless**: Thử nghiệm trên development projects, kết hợp với Signals để tối ưu performance
- **Route redirect functions**: Sử dụng cho cases cần conditional routing dựa trên query params, user roles
- **Fallback content**: Áp dụng ngay cho tất cả components có content projection
- **Form events**: Thay thế `valueChanges` + `statusChanges` riêng lẻ bằng unified `events` stream

## Chi tiết từng Feature

### 1. Zoneless Change Detection

```ts
// app.config.ts — Kích hoạt zoneless mode
providers: [
  provideExperimentalZonelessChangeDetection(),
]
```

- Loại bỏ zone.js → giảm overhead
- Developer kiểm soát thời điểm change detection
- Kết hợp với Signals cho reactive updates

### 2. Route Redirect as Function

```ts
// app.routes.ts — Redirect function
{
  path: 'product',
  redirectTo: ({ queryParams }) => {
    const id = queryParams['id'];
    return id ? 'product-detail' : 'not-found';
  },
}
```

- `redirectTo` nhận function thay vì string
- Có thể inject services và access query/route params
- Xử lý error cases dễ dàng hơn

### 3. Fallback Content for ng-content

```ts
// Component template — Fallback content
<ng-content select=".header">Default Header</ng-content>
<ng-content>No content available</ng-content>
```

- Default content hiển thị khi không có content được project
- Giảm boilerplate code (không cần `*ngIf`)
- Works với CSS selectors, id, attribute selectors

### 4. Form Control State Change Events

```ts
// Subscribe vào unified events stream
control.events.subscribe(event => {
  if (event.type === 'valueChange') {
    console.log('Value:', event.source.value);
  } else if (event.type === 'statusChange') {
    console.log('Status:', event.source.status);
  }
});
```

- Unified stream cho value và status changes
- Dynamic validation với `setValidators()` + `updateValueAndValidity()`
- Dễ dàng logging và debugging

## Tính năng quan trọng khác trong Angular 18

| Feature | Mô tả |
|---------|-------|
| **Event Coalescing mặc định** | Angular 18 bật event coalescing theo mặc định cho new projects, gộp nhiều change detection cycles |
| **Merged event coalescing** | Sử dụng cùng scheduler cho cả zone.js và zoneless apps |
| **Signal Inputs** | Signal-based inputs tiếp tục được cải thiện |
| **Directive Composition API** | Cho phép compose multiple directives vào một component |
| **Material 3** | Angular Material 18 hỗ trợ Material 3 design |

## Yêu cầu

- Angular 18+
- Node.js 18+

## Chạy thử

```bash
cd 1_zoneless  # Hoặc project khác
npm install
ng serve
```

## Tài liệu tham khảo

- [Angular 18 Release Notes](https://blog.angular.dev/angular-v18-is-now-available-e79d5ac0affe)
- [What's New in Angular 18 - Syncfusion](https://www.syncfusion.com/blogs/post/whats-new-in-angular-18)
- [Angular Official Documentation](https://angular.dev)