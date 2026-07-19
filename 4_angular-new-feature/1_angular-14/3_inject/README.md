# `inject()` Function (Angular 14)

> `inject()` function cho phép inject dependencies bên ngoài constructor, sử dụng trong class properties, field initializers, hoặc factory functions.

## Trước Angular 14

```ts
@Component({ ... })
export class AppComponent {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    console.log(this.authService.currentUser);
  }
}
```

## Sau Angular 14 - `inject()`

```ts
@Component({ ... })
export class AppComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  currentUser = this.authService.currentUser;
}
```

## Ví dụ 1: Basic Injection

```ts
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  // inject() thay thế constructor injection
  private auth = inject(AuthService);
  private logger = inject(LoggerService);

  ngOnInit() {
    this.logger.log('Component initialized');
    console.log(this.auth.currentUser);
  }
}
```

## Ví dụ 2: InjectionToken

```ts
const API_URL = new InjectionToken<string>('apiUrl');

@Component({
  selector: 'app-api',
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' }
  ]
})
export class ApiComponent {
  private apiUrl = inject(API_URL);

  fetchData() {
    return fetch(this.apiUrl + '/data');
  }
}
```

## Ví dụ 3: `@Inject()` vs `inject()`

```ts
// Cách cũ - @Inject() trong constructor
@Component({ ... })
export class OldComponent {
  constructor(
    @Inject('myToken') private token: string,
    @Inject(MY_TOKEN) private myToken: string,
  ) {}
}

// Cách mới - inject() function
@Component({ ... })
export class NewComponent {
  private token = inject<string>('myToken');
  private myToken = inject(MY_TOKEN);
}
```

## Ví dụ 4: inject trong Factory

```ts
// inject() hoạt động trong factory functions
export function createLogger() {
  const config = inject(AppConfig);
  return {
    log: (msg: string) => console.log(`[${config.level}] ${msg}`)
  };
}

// Usage trong component
@Component({ ... })
export class AppComponent {
  private logger = createLogger();
}
```

## Ví dụ 5: Conditional Injection

```ts
@Component({ ... })
export class SmartComponent {
  // inject với optional dependency
  private analytics = inject(AnalyticsService, { optional: true });

  trackEvent(event: string) {
    if (this.analytics) {
      this.analytics.track(event);
    }
  }
}
```

## Ví dụ 6: `inject()` trong Service

> **Có!** `providers` + `inject()` không chỉ dùng cho Component mà còn dùng được cho Service.

### Hiểu cách InjectionToken mapping

```ts
// ── Tạo token ──
// new InjectionToken<T>('description')
//                         ↑ chuỗi này CHỈ dùng để debug (hiện trong error messages)
//                           KHÔNG liên quan gì đến giá trị được inject

export const API_URL = new InjectionToken<string>('apiUrl');
//                          'apiUrl' ← chỉ là description, KHÔNG phải giá trị

// Thậm chí có thể bỏ trống:
export const API_URL_2 = new InjectionToken<string>('');
// Hoặc mô tả bất kỳ:
export const API_URL_3 = new InjectionToken<string>('This is the backend API url');
```

**Mapping giữa token và giá trị được quyết định hoàn toàn bởi `providers`:**

```ts
// { provide: token_key, useValue: actual_value }
//         ↑                        ↑
//    InjectionToken object    giá trị thực sự
//    (chính là API_URL)       ('https://api.example.com')

providers: [
  { provide: API_URL, useValue: 'https://api.example.com' }
]
```

### Ví dụ đầy đủ

```ts
import { Injectable, inject, InjectionToken } from '@angular/core';

// ── Tạo tokens ──
// Parameter string bên trong KHÔNG phải giá trị, chỉ là description
export const API_URL = new InjectionToken<string>('apiUrl');
export const TIMEOUT = new InjectionToken<number>('timeout');

// ── Service dùng inject() ──
@Injectable()
export class ApiService {
  private apiUrl = inject(API_URL);   // ← lookup: providers[API_URL] → 'https://api.example.com'
  private timeout = inject(TIMEOUT);  // ← lookup: providers[TIMEOUT] → 5000

  getData() {
    return fetch(this.apiUrl + '/data', {
      signal: AbortSignal.timeout(this.timeout)
    });
  }
}
```

**Cung cấp giá trị (providers) – đây mới là nơi quyết định value:**

```ts
@Component({
  selector: 'app-dashboard',
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' },
    //  ↑ key (token object)          ↑ value (string thật)
    { provide: TIMEOUT, useValue: 5000 },
    //  ↑ key (token object)     ↑ value (number thật)
    ApiService
  ]
})
export class DashboardComponent {
  private api = inject(ApiService);
}
```

> **Tóm lại mapping:**
> 
> ```
> new InjectionToken<string>('apiUrl')   ← description (debug only)
>                                            ↓ KHÔNG mapping
> providers: [
>   { provide: API_URL, useValue: 'https://api.example.com' }
>     ↑ key = API_URL object               ↑ value
> ]
>
> inject(API_URL)  ← lookup theo API_URL object → trả về 'https://api.example.com'
> ```

### Cách cung cấp values cho Service

**Cách 1: providers ở Component cha**

```ts
@Component({
  selector: 'app-dashboard',
  providers: [
    // Giá trị thực cho token
    { provide: API_URL, useValue: 'https://api.example.com' },
    { provide: TIMEOUT, useValue: 5000 },
    ApiService  // Register service tại component level
  ]
})
export class DashboardComponent {
  // DashboardComponent và các child component
  // có thể inject ApiService với giá trị đã config
  private api = inject(ApiService);
}
```

**Cách 2: providers ở Module**

```ts
@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' },
    { provide: TIMEOUT, useValue: 5000 },
    ApiService
  ]
})
export class AppModule { }
```

**Cách 3: providers ở route config (Angular 15+)**

```ts
// Standalone app - cấu hình route
export const routes: Routes = [
  {
    path: 'dashboard',
    providers: [
      { provide: API_URL, useValue: 'https://api.example.com' },
      { provide: TIMEOUT, useValue: 5000 },
      ApiService
    ],
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  }
];
```

**Cách 4: multi providers - nhiều giá trị cho cùng token**

```ts
const LOGGER = new InjectionToken<Function[]>('logger');

@Injectable()
export class LoggingService {
  private loggers = inject(LOGGER);  // Logger[]

  log(msg: string) {
    this.loggers.forEach(fn => fn(msg));
  }
}

// Cung cấp nhiều logger
@Component({
  providers: [
    { provide: LOGGER, useValue: console.log, multi: true },
    { provide: LOGGER, useValue: (msg: string) => alert(msg), multi: true },
  ]
})
export class AppComponent {}
```

## So sánh chi tiết

| Feature | Constructor Injection | `inject()` |
|---------|----------------------|------------|
| Syntax | `constructor(private svc: Service) {}` | `private svc = inject(Service)` |
| Optional | `{ optional: true }` trong decorator | `inject(Service, { optional: true })` |
| Hoisting | ✅ Có thể hoist | ❌ Không hoist |
| Lazy init | ❌ Luôn resolve khi create | ✅ Có thể conditional |
| Test | Dễ mock qua constructor | Cần TestBed setup |

## Best Practices

1. **Ưu tiên `inject()`** – Code gọn hơn, modern hơn
2. **Sử dụng `inject()` cho field initializers** – Thay vì constructor
3. **Factory functions** – `inject()` hoạt động tốt trong factories
4. **Thử nghiệm dần** – Có thể mix cả hai cách trong cùng codebase

---

**Summary**: `inject()` function là alternative hiện đại cho constructor injection. Nó hoạt động bên ngoài constructor, giúp code gọn hơn và hỗ trợ các use cases như conditional injection và factory pattern.