# Tạo Service: `@Service` và `injectAsync`

## Tổng quan
Angular 22 giới thiệu 2 thứ mới cho services: decorator `@Service` và helper `injectAsync()`. Lưu ý: `inject()` **không phải mới** — đã có từ v14. Điểm mới ở v22 là `@Service` (cách gọn hơn `@Injectable`) và `injectAsync` (inject lazy bất đồng bộ).

## Tính năng chính

- **`@Service()` mới (v22, stable)**: Alternative gọn nhẹ cho `@Injectable`. Mặc định `providedIn: 'root'`, chỉ cho phép `inject()` (không cho constructor injection), hỗ trợ duy nhất option `factory`/`autoProvided`
- **`injectAsync()` mới (v22)**: Lazy-load service bất đồng bộ. Trả về `() => Promise<T>` — phải **gọi hàm rồi mới `await`**
- **`inject()` có từ v14**: Không phải API mới v22, chỉ là nền tảng mà `@Service` dựa vào

## Ví dụ Code

### `@Service` thay cho `@Injectable`

```typescript
// Cách cũ - vẫn chạy bình thường
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}
```

```typescript
// Cách mới v22 - gọn hơn, mặc định providedIn: 'root'
import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class UserService {
  private http = inject(HttpClient);

  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}
```

> ℹ️ `@Service` không cho constructor-based injection, chỉ dùng `inject()`. Muốn tự provide (không auto root) thì đặt `autoProvided: false`. Không hỗ trợ `useClass`/`useValue` phức tạp như `@Injectable` — chỉ hỗ trợ `factory` đơn.

### `injectAsync()` cho Dependencies Lazy

```typescript
import { Service, injectAsync } from '@angular/core';

@Service()
export class AnalyticsService {
  // injectAsync trả về () => Promise<T> — nhớ GỌI rồi mới await
  private tracker = injectAsync(() => import('./analytics-tracker').then(m => m.Tracker));

  async trackEvent(event: string) {
    const t = await this.tracker();
    t.track(event);
  }
}
```

> ⚠️ Đính chính: `injectAsync(...)` trả về **hàm** `() => Promise<T>`, không phải `Promise` trực tiếp. Sai: `this.tracker.then(...)`. Đúng: `await this.tracker()`.

### Service với Nhiều Dependencies + Prefetch

```typescript
import { Service, inject, injectAsync } from '@angular/core';
import { onIdle } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Service()
export class DashboardService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  // Dependency nặng, lazy-load + prefetch khi browser idle
  private chartEngine = injectAsync(
    () => import('./chart-engine').then(m => m.ChartEngine),
    { prefetch: onIdle() }
  );

  async getDashboardData(): Promise<DashboardData> {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      throw new Error('Chưa được xác thực');
    }

    return firstValueFrom(this.http.get<DashboardData>('/api/dashboard'));
  }

  async renderChart(data: DataPoint[]) {
    const engine = await this.chartEngine();
    return engine.render(data);
  }
}
```

### So Sánh: Trước vs Sau

```typescript
// Angular 21 và trước đó
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  constructor(
    private http: HttpClient,
    private config: AppConfig,
    private router: Router
  ) {}

  log(message: string) {
    this.http.post('/api/logs', { message, level: 'info' }).subscribe();
  }
}

// Angular 22 - @Service + inject(), hành vi tương tự
import { Service, inject } from '@angular/core';

@Service()
export class LoggerService {
  private http = inject(HttpClient);
  private config = inject(AppConfig);
  private router = inject(Router);

  log(message: string) {
    this.http.post('/api/logs', { message, level: 'info' }).subscribe();
  }
}
```

## Lợi Ích

| Khía cạnh | `@Injectable` + constructor | `@Service` + `inject()` |
|--------|------------|-----------|
| **Boilerplate** | Dài dòng hơn | Ít code hơn, mặc định root |
| **Lazy loading** | Thủ công | `injectAsync()` tích hợp sẵn, có `prefetch` |
| **Type safety** | Hỗ trợ đầy đủ | Hỗ trợ đầy đủ |
| **Lưu ý** | Hỗ trợ `useClass`/`useValue` đầy đủ | Chỉ `factory`, không constructor injection |

> ℹ️ Service lazy-load qua `injectAsync` yêu cầu service được auto-provided (`@Injectable({providedIn: 'root'})` hoặc `@Service()`).

## Tham khảo
- [Angular v22 changelog — introduce `@Service` decorator, Add `injectAsync` helper, mark service decorator as stable](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular 22 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
