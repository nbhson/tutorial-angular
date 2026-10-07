# Performance Guide (v22)

> Nguồn: https://angular.dev/guide/performance

## Tổng quan
Công thức chuẩn v22: **zoneless (default v21) + OnPush (default v22) + signals + `@defer` + SSR/hybrid**.

## Điểm chính
1. Dùng signals (`signal/computed/linkedSignal`) để view chỉ check khi cần.
2. `@defer (on viewport)` cho phần nặng; `@for track` + virtual scroll cho list lớn.
3. `NgOptimizedImage` (`ngSrc`) + `httpResource` transfer-cache tránh fetch trùng server/client.
4. Đo bằng DevTools flame chart + `ng update` giữ bản mới nhất.

## Ví dụ Code
```html
@defer (on viewport) {
  <app-heavy-chart [data]="data()" />
} @placeholder { <p>Đang tải biểu đồ…</p> }

<img ngSrc="/hero.jpg" width="800" height="400" priority />
```

```typescript
// OnPush là default v22 — không cần set tay cho component mới
@Component({ selector: 'app-fast', template: `{{ v() }}` })
export class Fast { v = signal(0); }
```

## Tham khảo
- [Performance](https://angular.dev/guide/performance)
- `2_angular-techniques/3_performance-optimization/`, `9_angular-22/1_onpush-default/`
