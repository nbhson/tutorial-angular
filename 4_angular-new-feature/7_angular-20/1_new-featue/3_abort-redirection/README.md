# 3. Abort Redirection (Angular 20)

## Tổng quan

Angular 20 giới thiệu `Router.getCurrentNavigation()?.abort()` — cho phép **huỷ bỏ navigation đang chạy** (abort navigation). Đây là API mới trong routing system, giải quyết vấn đề "stale navigation" khi user thay đổi ý nhanh.

## API mới

```typescript
Router.getCurrentNavigation()?.abort()
```

Hoặc trong Guards/Interceptors:

```typescript
const navigation = this.router.getCurrentNavigation();
if (navigation) {
  navigation.abort();
}
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

## Use cases

### 1. Browser Stop Button

Khi user bấm nút **Stop** trên browser khi route đang load:

```typescript
// Trong app.component.ts hoặc routing interceptor
export class AppComponent {
  constructor(private router: Router) {
    // Lắng nghe sự kiện browser stop (nếu có)
    window.addEventListener('beforeunload', () => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation) {
        navigation.abort();
      }
    });
  }
}
```

### 2. Lazy Loading Module

Khi user click vào route có lazy module lớn, đang load thì user click sang route khác:

```typescript
// routes.ts
{
  path: 'heavy-module',
  loadChildren: () => import('./heavy-module/heavy-module.routes')
    .then(m => m.routes),
  // Nếu user click link khác trong lúc load,
  // Angular sẽ abort navigation này
}
```

### 3. Fast Navigation (User navigates quickly between routes)

```typescript
export const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
    canActivate: [
      (route, state) => {
        const router = inject(Router);
        const dataService = inject(DataService);

        // Nếu navigation đã bị abort, bỏ qua
        const navigation = router.getCurrentNavigation();
        if (navigation?.aborted) {
          return false;
        }

        return dataService.preloadData().pipe(
          map(() => true)
        );
      }
    ]
  }
];
```

### 4. Debounced Navigation

```typescript
// Component với search functionality
@Component({
  selector: 'app-search',
  template: `
    <input (input)="onSearch($event)" placeholder="Tìm kiếm...">
    <app-results [data]="results" />
  `
})
export class SearchComponent {
  private router = inject(Router);

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;

    // Hủy navigation trước đó (nếu có)
    const currentNav = this.router.getCurrentNavigation();
    if (currentNav) {
      currentNav.abort();
    }

    // Navigate đến search results
    this.router.navigate(['/search'], {
      queryParams: { q: query }
    });
  }
}
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

### Sau Angular 20

```typescript
// Dễ dàng hủy navigation
const navigation = this.router.getCurrentNavigation();
if (navigation) {
  navigation.abort();  // Hủy ngay lập tức
}
```

**Lợi ích:**
- ✅ API đơn giản, trực quan
- ✅ Hủy navigation ngay lập tức
- ✅ Không có race condition
- ✅ Works với lazy loading

## Các pattern phổ biến

### 1. Guard with Abort Check

```typescript
export const dataGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dataService = inject(DataService);

  // Kiểm tra navigation có bị abort không
  const navigation = router.getCurrentNavigation();
  if (navigation?.aborted) {
    return false;
  }

  return dataService.fetchData().pipe(
    map(data => {
      if (data) {
        return true;
      }
      return router.createUrlTree(['/error']);
    })
  );
};
```

### 2. Interceptor Pattern

```typescript
@Injectable()
export class NavigationAbortInterceptor implements RouteInterceptor {
  private router = inject(Router);

  intercept(route: Route, state: RouterStateSnapshot) {
    const navigation = this.router.getCurrentNavigation();

    // Nếu navigation bị abort, trả về false
    if (navigation?.aborted) {
      return of(false);
    }

    // Tiếp tục navigation
    return of(true);
  }
}
```

### 3. Component Cleanup

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

1. **Luôn check `navigation?.aborted`** trước khi thực hiện side effects
2. **Dùng `takeUntil`** trong components để cleanup subscriptions khi navigation bị abort
3. **Không abort navigation trong guards** — để Angular xử lý tự nhiên
4. **Debug bằng `Router.events`** để theo dõi navigation flow

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