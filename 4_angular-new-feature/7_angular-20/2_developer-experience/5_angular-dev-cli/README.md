# 5. CLI trong v20 (đã hiệu chỉnh — KHÔNG có `ng analyze` / `ng performance`)

> Đính chính toàn file: **KHÔNG có `ng analyze` / `ng performance` / `generate --mock`**.
> CLI thật trong v20: schematic **`--zoneless`**, **template HMR default**,
> `ng update @angular/core @angular/cli`, `TestBed.tick()` cho zoneless tests.

## Commands đúng (v20)

```bash
# Tạo app/component zoneless (schematic --zoneless mới v20):
ng new my-app --zoneless
ng generate component my-component

# HMR template đã default trong v20 (không cần flag riêng)

# Migrate project lên v20:
ng update @angular/core @angular/cli

# Dry run:
ng update @angular/core --dry-run
```

## Tại sao cần?

| Vấn đề | Giải thích |
|---|---|
| **Slow build** | Bundle size lớn, build time dài |
| **Code generation** | Phải viết boilerplate thủ công |
| **Migration** | Phải upgrade thủ công từ version cũ |
| **Bundle analysis** | Không biết bundle lớn do đâu |

Angular Dev CLI giải quyết:
- **Smart code generation** với templates
- **Automated migration** scripts
- **Bundle analysis** tools
- **Performance optimization** suggestions

## Ví dụ thực tế

### 1. Generate Component

```bash
# Generate component với routing
ng generate component dashboard --routing --standalone

# Generate component với test
ng generate component user --spec

# Generate component trong folder
ng generate component features/admin/dashboard
```

**Kết quả:**
```
src/app/features/admin/dashboard/
├── dashboard.component.ts
├── dashboard.component.html
├── dashboard.component.scss
├── dashboard.component.spec.ts
└── dashboard.component.routes.ts
```

### 2. Migrate lên v20 (thật)

```bash
# Upgrade Angular project
ng update @angular/core @angular/cli

# Dry run trước
ng update @angular/core --dry-run
```

### 3. Test zoneless với `TestBed.tick()` (mới quanh v20)

```typescript
// Trong zoneless tests, dùng TestBed.tick() để flush effects/render:
import { TestBed } from '@angular/core/testing';

it('updates zoneless', async () => {
  const fixture = TestBed.createComponent(CounterComponent);
  fixture.componentRef.setInput('count', 1);
  TestBed.tick(); // flush thay vì fixture.detectChanges()/auto-detect
  expect(fixture.nativeElement.textContent).toContain('1');
});
```

## Flow chi tiết

```
ng generate component dashboard
        │
        ▼
Angular CLI tạo files từ templates
        │
        ▼
dashboard.component.ts
dashboard.component.html
dashboard.component.scss
dashboard.component.spec.ts
        │
        ▼
Auto-update app.routes.ts
        │
        ▼
Component sẵn sàng sử dụng
```

## Best practices

1. **Dùng `ng generate`** thay vì tạo files thủ công
2. **Dùng `--zoneless`** cho project mới muốn thử zoneless preview
3. **Use `ng update`** để upgrade an toàn (+ `--dry-run` trước)
4. **Dùng `TestBed.tick()`** cho zoneless tests
5. ❌ Không dùng `ng analyze` / `ng performance` — không tồn tại

## Chạy thử

```bash
# Generate component
ng generate component demo

# Tạo app zoneless (mới v20)
ng new my-app --zoneless
```