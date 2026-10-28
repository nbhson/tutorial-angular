# Day 20: Testing — Unit test (Vitest) + E2E (Playwright)

## Muc tieu

- Hieu 2 loai test trong Angular: unit test (TestBed + Vitest) va E2E (Playwright).
- Viet unit test cho component, service, pipe voi `TestBed`.
- Test HttpClient voi `HttpTestingController`.
- Chuyen tu Jasmine/Karma sang Vitest (v21+ mac dinh).
- Viet E2E test voi Playwright: navigate, click, assert.
- So sanh voi React (Vitest + RTL + Playwright).

## Khoi niem coi loi

### Testing pyramid trong Angular

| Loai | Tool | Chay | Muc dich |
|---|---|---|---|
| Unit | Vitest (v21+ default), Jasmine/Karma (cu) | `ng test` | Test 1 component/service/pipe rieng le |
| Integration | TestBed + HttpClientTestingModule | `ng test` | Test component + HTTP + DI |
| E2E | Playwright | `npx playwright test` | Test luong nguoi dung tren browser that |

### Vitest la default tu v21

Tu Angular v21, `ng new` tao project voi Vitest thay cho Karma/Jasmine (Karma da bi deprecate). Cau hinh:

```bash
# Project moi (v21+) da co san Vitest
ng new my-app
ng test              # chay unit test voi Vitest

# Project cu: migrate tu Jasmine sang Vitest
ng generate @schematics/angular:refactor-jasmine-vitest
```

```json
// angular.json — builder unit-test moi
{
  "projects": {
    "my-app": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
  }
}
```

## Vi du chi tiet

### 1. Unit test component co signal

```ts
// counter.component.ts
import { Component, signal, computed } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">Tang</button>
  `,
})
export class CounterComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);

  increment() {
    this.count.update(v => v + 1);
  }
}
```

```ts
// counter.component.spec.ts (Vitest + TestBed)
import { TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';
import { expect, it, describe } from 'vitest';

describe('CounterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();
  });

  it('tao component thanh cong', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hien thi count ban dau la 0', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    TestBed.tick(); // zoneless (v20+): dung TestBed.tick() thay fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('p')?.textContent).toContain('Count: 0');
  });

  it('tang count khi click nut', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    const comp = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;

    comp.increment();
    TestBed.tick();

    expect(comp.count()).toBe(1);
    expect(comp.double()).toBe(2);
    expect(el.querySelector('p')?.textContent).toContain('Count: 1');
  });
});
```

**Zoneless (v20+)**: thay `fixture.detectChanges()` bang `TestBed.tick()` — dong bo hon, khong can `fakeAsync`/`tick` nua.

### 2. Test service voi HttpTestingController

```ts
// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { expect, it, describe, beforeEach, afterEach } from 'vitest';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),        // HttpClient that
        provideHttpClientTesting(), // Mock backend
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Sau moi test, kiem tra khong con request nao bi bo sot
  afterEach(() => httpMock.verify());

  it('goi GET /users va tra ve danh sach', () => {
    const mockUsers = [
      { id: 1, name: 'An', email: 'an@example.com' },
      { id: 2, name: 'Binh', email: 'binh@example.com' },
    ];

    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users[0].name).toBe('An');
    });

    // "chot" request dang cho
    const req = httpMock.expectOne('https://api.example.com/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers); // gia lap response
  });

  it('xu ly loi 404', () => {
    let errorResponse: any;
    service.getUsers().subscribe({ error: (err: any) => errorResponse = err });

    const req = httpMock.expectOne('https://api.example.com/users');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(errorResponse.status).toBe(404);
  });
});
```

### 3. Test component co input + output

Voi component `GreeterComponent` co `name = input.required<string>()` va `greeted = output<string>()`, test nhu sau:

```ts
// greeter.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { GreeterComponent } from './greeter.component';
import { expect, it, describe } from 'vitest';

describe('GreeterComponent', () => {
  it('emit su kien greeted khi click', () => {
    const fixture = TestBed.createComponent(GreeterComponent);
    const comp = fixture.componentInstance;
    TestBed.tick();

    let received = '';
    comp.greeted.subscribe((name: string) => received = name);

    // Test output qua subscribe
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    TestBed.tick();

    expect(received).toBe('Huy');
  });
});
```

### 4. Playwright E2E — test luong nguoi dung

```bash
npm i -D @playwright/test
npx playwright install chromium
```

```ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('login thanh cong roi redirect ve dashboard', async ({ page }) => {
    await page.goto('http://localhost:4200/login');

    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mat khau').fill('secret123');
    await page.getByRole('button', { name: 'Dang nhap' }).click();

    // Cho redirect + assert URL
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Chao mung admin')).toBeVisible();
  });
});
test.describe('CRUD users', () => {
  test('them user moi roi xoa', async ({ page }) => {
    await page.goto('http://localhost:4200/users');

    // Them user
    await page.getByPlaceholder('Ten').fill('Test User');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Them' }).click();
    await expect(page.getByText('Test User')).toBeVisible();

    // Xoa user
    const row = page.locator('tr', { hasText: 'Test User' });
    await row.getByRole('button', { name: 'Xoa' }).click();
    await expect(row).not.toBeVisible();
  });
});
```

```json
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start',  // tu khoi dong dev server truoc khi chay test
    url: 'http://localhost:4200',
    reuseExistingServer: true,
  },
});
```

### 5. Test pipe — khong can TestBed

Pipe la class thuan nen test truc tiep: `new TruncatePipe().transform('hello world', 5)` va assert ket qua, khong can `TestBed`.

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| Unit test runner | Vitest (v21+), Jasmine/Karma (cu) | Vitest / Jest |
| Render trong test | `TestBed.createComponent()` | `render()` (React Testing Library) |
| Query DOM | `nativeElement.querySelector` / `By.css` | `getByRole`, `getByText` (RTL) |
| Mock HTTP | `HttpTestingController` | `msw` (Mock Service Worker) |
| Fake timer | Vitest `vi.useFakeTimers` (hoac `fakeAsync` cu) | Vitest `vi.useFakeTimers` |
| E2E | Playwright | Playwright |
| Zoneless test | `TestBed.tick()` | (khong lien quan) |

```tsx
// React equivalent: Vitest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import Counter from './Counter';

describe('Counter', () => {
  it('tang count khi click', () => {
    render(<Counter />);
    expect(screen.getByText(/Count: 0/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tang' }));
    expect(screen.getByText(/Count: 1/)).toBeInTheDocument();
  });
});
```

Giong nhau: ca 2 deu khuyen test theo **hanh vi nguoi dung** (query by role/text) thay vi implementation detail. Khac nhau: Angular TestBed tao full DI context, React test chi render component thuần.

## Loi thuong gap

### 1. Test khong phat hien thay doi template

Khi component su dung `OnPush` hoac zoneless, sau khi cap nhat state phai goi `TestBed.tick()` (hoac `fixture.detectChanges()` voi zone) de re-render. Khong goi -> DOM cu va assert sai.

### 2. Quen `provideHttpClientTesting()`

Test component/service goi HttpClient ma chi `provideHttpClient()` thi request that se di ra (khoi fail). Luon them `provideHttpClientTesting()` va `HttpTestingController`.

### 3. `httpMock.verify()` khong goi

Neu test con request pending chua flush, test sau co the bi loi kieu la. Luon `afterEach(() => httpMock.verify())`.

### 4. E2E test phu thuoc thoi gian

Dung `await expect(...)` (Playwright auto-wait) thay vi `page.waitForTimeout(3000)` — test nhanh hon va on dinh hon.

### 5. Quen chay E2E voi server that

Playwright config nen khai bao `webServer` de tu khoi dong dev server. Neu khong, test bi loi `ECONNREFUSED`.

## Best practices

1. **Unit test la nen tang**: moi component/service/pipe nen co unit test, chay nhanh.
2. **Test theo behavior**: assert tren role/text nguoi dung thay vi implementation chi tiet.
3. **Zoneless**: dung `TestBed.tick()` thay `fixture.detectChanges()` trong project v20+.
4. **E2E chi giu cac luong chinh** (login, checkout, CRUD chinh) — khong viet E2E cho moi chi tiet, vi cham va de vo.
5. **CI**: chay `ng test` + `npx playwright test` trong CI cho moi PR; chay Chromium + 1 mobile viewport la du cho da truong hop.

## Bai tap

1. **Bai 1**: Viet unit test cho `CounterComponent` (Day 14): kiem tra init, increment, double computed.

2. **Bai 2**: Viet unit test cho `UserService` (Day 11) voi `HttpTestingController`: GET list, GET detail, POST, DELETE, va error 500.

3. **Bai 3**: Viet E2E Playwright cho todo app: them todo, danh dau done, xoa todo. Veri flow giua 2 page.

4. **Bai 4**: Migrate 1 Jasmine spec cu (neu co) sang Vitest: doi `describe/it/expect` (tu `@angular/core/testing` sang import tu `vitest`), doi `fakeAsync/tick` thanh `TestBed.tick()`.

## Reference

- [Testing — Angular.dev](https://angular.dev/guide/testing)
- [Unit test components](https://angular.dev/guide/testing/components)
- [Testing HTTP](https://angular.dev/guide/http/testing)
- [Vitest default (blog v21)](https://blog.angular.dev)
- [Playwright docs](https://playwright.dev)
- [Zoneless testing](https://angular.dev/guide/experimental/zoneless)
