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