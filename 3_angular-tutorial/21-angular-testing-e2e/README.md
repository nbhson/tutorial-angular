# Angular Testing & E2E (Vitest + Playwright)

> Nguồn: https://angular.dev/guide/testing — repo có unit (Jasmine/Jest/Vitest) nhưng thiếu E2E

## Tổng quan
Mặc định mới: **Vitest** cho unit (`@angular/build:unit-test`, `ng generate @schematics/angular:refactor-jasmine-vitest`), **Playwright** cho E2E. `TestBed.tick()` (v20+) test zoneless không cần `fakeAsync`.

## Điểm chính
| Loại | Tool | Lệnh |
|---|---|---|
| Unit mới | Vitest | `ng test` (builder `unit-test`) |
| Unit cũ | Jasmine/Karma, Jest | `16-angular-jest-framework/` (giữ để migrate) |
| E2E | Playwright | `npx playwright test` |

## Ví dụ Code
```typescript
// counter.spec.ts (Vitest + TestBed)
import { TestBed } from '@angular/core/testing';
import { Counter } from './counter';

it('tăng counter', async () => {
  const fixture = TestBed.createComponent(Counter);
  await fixture.whenStable();
  fixture.componentInstance.count.set(1);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('p')?.textContent).toContain('1');
});
```

```typescript
// Zoneless v20+: dùng TestBed.tick() thay fakeAsync/tick
import { TestBed } from '@angular/core/testing';
it('signal update', () => {
  TestBed.createComponent(Counter);
  TestBed.tick();
  expect(document.querySelector('p')?.textContent).toContain('1');
});
```

```typescript
// e2e/login.spec.ts (Playwright)
import { test, expect } from '@playwright/test';
test('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('a@x.com');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```

```bash
npm init playwright@latest   # sinh playwright.config.ts
npx playwright test
ng generate @schematics/angular:refactor-jasmine-vitest  # migrate unit
```

## Tham khảo
- [Testing](https://angular.dev/guide/testing)
- `2_angular-techniques/6_dev-tools/16-angular-jest-framework/`, `4_angular-new-feature/8_angular-21/10_vitest-default/`
