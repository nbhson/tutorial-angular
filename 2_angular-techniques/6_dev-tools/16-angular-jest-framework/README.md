# Unit Test với Vitest (thay thế Jest/Karma)

> Nguồn: https://angular.dev/guide/testing — https://angular.dev/cli/test — blog.angular.dev "Angular v21: Vitest by default"

## Vitest là runner mặc định

Từ **Angular v21**, **Vitest** là test runner **mặc định** cho project mới (`ng new`) — thay thế Karma/Jasmine (deprecated từ v20, xoá hoàn toàn ở v21+). Lý do:

- Chạy trên **Node + Vite**, không cần browser thật (Chromedriver, headless Chrome) → khởi động gần như tức thì.
- Watch mode và HMR nhanh hơn nhiều lần so với Karma.
- API tương tự Jest (`describe`, `it`, `expect`) — code test cũ chuyển sang gần như không đổi.
- Hỗ trợ **zoneless testing** (bắt buộc với app zoneless từ v21+).

> Thứ tự sử dụng: **Vitest (mặc định v21+)** → Jest (tùy chọn v21) → Karma (đã xoá khỏi v21).

## Project mới (Angular v22)

```bash
ng new my-app
# Vitest được cài sẵn — chạy được ngay
ng test
```

```json
// angular.json (mặc định v22)
{
  "projects": {
    "my-app": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "buildTarget": "::development",
            "watch": false,
            "coverage": true
          }
        }
      }
    }
  }
}
```

## Ví dụ test cơ bản

```typescript
// app.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello');
  });
});
```

## Matchers (giữ nguyên từ Jest/Jasmine)

```typescript
// Tham trị
expect(a).toBe(5);             // Object.is
// Tham chiếu
expect(obj).toEqual({ a: 1 }); // deep equal

// Truthiness
expect(x).toBeNull();
expect(x).toBeUndefined();
expect(x).toBeTruthy();
expect(x).toBeFalsy();
expect(x).not.toBeTruthy();

// Số
expect(n).toBeGreaterThan(3);
expect(n).toBeGreaterThanOrEqual(3.5);
expect(x).toBeLessThan(5);

// Chuỗi
expect('Angular v22').toMatch(/v22/);
expect('hello world').toContain('world');

// Array/iterable
expect([1, 2, 3]).toContain(2);

// Exception
expect(() => dangerousFn()).toThrow();
expect(() => parse('bad')).toThrow(InvalidFormatError);
```

## Async testing

```typescript
// async/await
test('tải user', async () => {
  const user = await userService.find(1);
  expect(user.name).toBe('An');
});

// resolves / rejects
await expect(fetchData()).resolves.toBe('ok');
await expect(fetchData()).rejects.toMatch('error');

// Vitest timers (thay thế jest.useFakeTimers)
import { vi } from 'vitest';
vi.useFakeTimers();
setTimeout(() => callback(), 1000);
vi.advanceTimersByTime(1000);
```

## Test component với signals (Angular 22)

```typescript
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CounterComponent', () => {
  it('tăng giá trị khi click', async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(CounterComponent);
    await fixture.whenStable();

    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('1');
  });
});
```

> Với zoneless testing, `fixture.detectChanges()` trở thành không bắt buộc — Angular tự kích hoạt CD qua signal. `await fixture.whenStable()` là cách đợi async renderer hoàn tất.

## TestBed — DI và mock

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(), // thay thế HttpTestingController cũ
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('gọi API đúng endpoint', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'An' }]);
  });
});
```

## So sánh Karma / Jest / Vitest

| | Karma (≤ v20) | Jest (tùy chọn) | **Vitest (mặc định v21+)** |
|---|---|---|---|
| Environment | Browser thật | jsdom (Node) | Node hoặc browser |
| Tốc độ khởi động | Chậm (10–30s) | Trung bình | Rất nhanh (<1s) |
| HMR cho test | ❌ | ❌ | ✅ |
| Cấu hình | karma.conf.js + test.ts | jest.config.ts | Tích hợp sẵn CLI |
| Coverage | Phải cấu hình | `--coverage` | `ng test --coverage` |
| Snapshot | Không | ✅ | ✅ |

## Di chuyển từ Jest sang Vitest

```bash
# Angular cung cấp schematic chuyển đổi (từ v21)
ng generate @schematics/angular:refactor-jasmine-vitest  # Jasmine→Vitest
ng update @angular/cli@22                                # migration tự động
```

Xoá config Jest cũ (`jest.config.ts`, `setup-jest.ts`), Vitest dùng `vite.config`/`angular.json` — không cần file config riêng cho case chuẩn.

```bash
# Gỡ jest-related packages nếu có
npm uninstall jest @types/jest jest-preset-angular @types/jest
```

## Debug một test cụ thể

```bash
ng test --include='**/user.service.spec.ts'
ng test --watch            # chạy lại khi file đổi
ng test --coverage         # tính độ bao phủ
ng test --browsers=chromium  # nếu chạy với browser mode
```

## Lỗi thường gặp

- **`Zone is required`** — app bật zoneless nhưng test file thiếu `provideZonelessChangeDetection()`.
- **"document is not defined"** — cần bật môi trường jsdom/happy-dom trong Vitest config (schematic đã cấu hình, chỉ cần biết khi tự viết).
- **Test service qua HttpClient không chạy** — thiếu `provideHttpClientTesting()` trong providers.
- **Timeout khi test async** — dùng `await fixture.whenStable()` thay vì chỉ `fixture.detectChanges()`.

## Checklist

- [ ] Đang dùng Vitest (không còn Karma/Jasmine).
- [ ] File test đặt cạnh source (`*.spec.ts`).
- [ ] Đã bật `provideZonelessChangeDetection()` trong TestBed cho app zoneless.
- [ ] Coverage bật với `ng test --coverage`.

## Tham khảo

- [angular.dev — Testing](https://angular.dev/guide/testing)
- [Vitest — vitest.dev](https://vitest.dev)
- [Bài 10 — Vitest mặc định từ Angular 21](../../4_angular-new-feature/8_angular-21/10_vitest-default/README.md)
