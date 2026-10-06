# 10. Vitest là Default Test Framework (Angular 21)

## Tổng quan

Angular 21 đưa **Vitest** trở thành **default test framework** cho project mới. Previously, Jasmine + Karma là default. Vitest là lightweight test framework với blazing fast test execution, support cho TypeScript, ESM, và source code transformation.

## Tại sao cần Vitest?

### Jasmine/Karma (trước)

```bash
ng new my-app
# Dùng Jasmine + Karma
# Chậm khi project lớn
# Karma browser dependency
```

### Vitest (sau)

```bash
ng new my-app
# Dùng Vitest — blazing fast
# Không cần browser dependency
# ESM-native
# Hoạt động tốt với Node.js
```

## So sánh

| Jasmine/Karma (trước) | Vitest (sau) |
|---|---|
| Chậm khi project lớn | Blazing fast execution |
| Cần browser để chạy tests | Chạy trên Node.js |
| CommonJS-based | ESM-native |
| Config phức tạp hơn | Config đơn giản hơn |
| Karma browser launcher cần thiết | Không cần Karma |

## Setup

### Project Mới (Angular 21+)

```bash
ng new my-app
# Vitest đã là default — không cần thêm gì
```

### Migration từ Jasmine/Karma

```bash
# Schematic chính thức (tên đúng):
ng generate @schematics/angular:refactor-jasmine-vitest
# alias tương đương trên một số version CLI:
# ng generate @schematics/angular:karma-to-vitest
```

## Ví dụ

### Test File với Vitest

```typescript
// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch users', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];

    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('Alice');
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(mockUsers);
  });

  it('should create user', () => {
    const newUser: CreateUserDto = { name: 'Charlie', email: 'charlie@example.com' };

    service.createUser(newUser).subscribe((user) => {
      expect(user.name).toBe('Charlie');
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 3, ...newUser });
  });
});
```

### Vitest Config (Angular builder chính thức)

Từ Angular 21, Vitest chạy qua builder **`@angular/build:unit-test`** (không cần plugin `@analogjs/vitest-angular` thủ công cho project mới). Cấu hình test nằm trong `angular.json` qua `runnerConfig`:

```json
// angular.json (minh họa)
{
  "projects": {
    "my-app": {
      "architect": {
        "unit-test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runnerConfig": "vitest.config.ts",
            "tsConfig": "tsconfig.spec.json"
          }
        }
      }
    }
  }
}
```

```typescript
// vitest.config.ts — runnerConfig tối giản
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
```

> ℹ️ Các project dùng `@analogjs/vitest-angular` trước đây vẫn chạy, nhưng project mới nên dùng builder `@angular/build:unit-test` + `runnerConfig` theo [blog v21](https://blog.angular.dev/announcing-angular-v21-57946c34f14b).

## Migration

### Bước 1 — Chạy schematic chính thức

```bash
ng generate @schematics/angular:refactor-jasmine-vitest
```

Schematic tự cài deps, sinh `runnerConfig`, gắn builder `@angular/build:unit-test` vào `angular.json`.

### Bước 3 — Cập nhật package.json scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Bước 4 — Xóa Karma config

```bash
rm karma.conf.js
```

## Best Practices

1. **Dùng Vitest cho project mới** — Đã là default từ Angular 21
2. **Migrate project lớn dần dần** — Có thể dùng song song Jasmine và Vitest
3. **Sử dụng `globals: true`** — Để không cần import `describe`, `it`, `expect`
4. **Test isolation** — Mỗi test chạy độc lập, không share state

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Vitest Official](https://vitest.dev/)
- [Angular Vitest Migration Guide](https://angular.dev/reference/migrations/vitest-migration)