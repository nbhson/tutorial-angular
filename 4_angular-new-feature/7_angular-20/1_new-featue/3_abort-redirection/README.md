# 3. Abort Redirection (mới v20 — #60380, đã hiệu chỉnh)

> Đính chính: `Navigation.abort()` có thật (#60380) nhưng **KHÔNG có `.aborted`**.
> `Router.getCurrentNavigation()` đã deprecated từ **20.2** → dùng signal
> `Router.currentNavigation` (hoặc `inject(Router).currentNavigation`).
> Đã xóa các ví dụ tự chế `beforeunload` / debounce.

## Tổng quan

Angular 20 giới thiệu `Navigation.abort()` — cho phép **huỷ bỏ navigation đang chạy**.

## API đúng

```typescript
const router = inject(Router);
// v20.0:
const nav = router.getCurrentNavigation();
nav?.abort(); // ✅ có thật (#60380). KHÔNG có nav.aborted

// Từ 20.2+: getCurrentNavigation deprecated → dùng signal:
const current = router.currentNavigation(); // Signal<Navigation | null>
current?.abort();
```

## Tại sao cần feature này?

Khi user click vào một link → route bắt đầu load → nhưng user **thay đổi ý** và click link khác. Lúc này:

- Navigation cũ vẫn đang chạy (đang load lazy module, đang fetch data...)
- Navigation mới bắt đầu
- **Kết quả**: Có thể có race condition, UI bị flicker, hoặc navigation cũ hoàn thành sau navigation mới

`abort()` giải quyết vấn đề này bằng cách **hủy bỏ navigation cũ** ngay lập tức.

## Flow chi tiết

```
User click Link A
        │
        ▼
Navigation A bắt đầu (đang load lazy module)
        │
        ▼
User click Link B (thay đổi ý)
        │
        ▼
Navigation A.abort() → Hủy bỏ navigation A
        │
        ▼
Navigation B bắt đầu → Load route B
        │
        ▼
UI hiển thị route B (không có race condition)
```

## Use cases (đúng API)

### 1. Lazy Loading Module

Khi user click vào route có lazy module lớn, Angular tự quản lý navigation;
`abort()` chỉ dùng khi cần hủy navigation đang chạy từ guard/logic hợp lệ —
không gắn `beforeunload` hay debounce tự chế.

### 2. Fast Navigation — kiểm tra `NavigationCancel`, không phải `.aborted`

```typescript
export const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  }
];

// Debug navigation flow bằng Router.events:
this.router.events.subscribe(event => {
  if (event instanceof NavigationCancel) {
    console.log('Navigation cancelled:', event.url, event.reason);
  }
});
```

## So sánh trước và sau Angular 20

### Trước Angular 20

```typescript
// Không có cách hủy navigation
// Phải dùng workaround phức tạp
{
  path: 'some-route',
  canDeactivate: [
    () => {
      // Phải tạo flag manually
      if (isNavigating) {
        return false;  // Chặn navigation mới
      }
      return true;
    }
  ]
}
```

**Nhược điểm:**
- ❌ Không thể hủy navigation đang chạy
- ❌ Phải dùng `canDeactivate` hack
- ❌ Race condition vẫn xảy ra

### Sau v20 (API đúng)

```typescript
// Hủy navigation đang chạy (v20.0):
const navigation = this.router.getCurrentNavigation();
navigation?.abort(); // KHÔNG có .aborted

// Từ 20.2+:
this.router.currentNavigation()?.abort();
```

**Lợi ích:**
- ✅ API đơn giản, trực quan
- ✅ Hủy navigation ngay lập tức
- ✅ Không có race condition
- ✅ Works với lazy loading

## Các pattern đúng (không dùng `.aborted`)

### 1. Guard trả UrlTree thay vì check `.aborted`

```typescript
export const dataGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dataService = inject(DataService);

  return dataService.fetchData().pipe(
    map(data => data ? true : router.createUrlTree(['/error']))
  );
};
```

### 2. Component Cleanup với takeUntilDestroyed

```typescript
@Component({
  selector: 'app-heavy',
  template: `<div *ngIf="loading">Loading...</div>`
})
export class HeavyComponent implements OnInit, OnDestroy {
  loading = true;
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.http.get('/api/heavy-data').pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.loading = false;
      this.data = data;
    });
  }
}
```

## Best practices

1. **Không dùng `navigation?.aborted`** — property này không tồn tại
2. **Dùng `takeUntilDestroyed()`** trong components để cleanup subscriptions
3. **Không abort navigation trong guards** — để Angular xử lý tự nhiên
4. Từ **20.2+** dùng signal `router.currentNavigation()` thay cho `getCurrentNavigation()` (deprecated)

```typescript
// Debug navigation events
this.router.events.subscribe(event => {
  if (event instanceof NavigationStart) {
    console.log('Navigation started:', event.url);
  }
  if (event instanceof NavigationEnd) {
    console.log('Navigation ended:', event.url);
  }
  if (event instanceof NavigationCancel) {
    console.log('Navigation cancelled:', event.url);
  }
});
```

## Chạy thử

```bash
cd 4_angular-new-feature/7_angular-20/1_new-featue/3_abort-redirection
npm install
ng serve
```

Thử click nhanh giữa các route để xem abort navigation hoạt động.