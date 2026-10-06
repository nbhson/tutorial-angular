# Language Service và DevTools

## Tổng quan
Angular 22 mang đến đúng 3 feat language-service/defer theo changelog — không có "signal graph visualization" hay "component profiler" như bản cũ mô tả (nội dung đó đã xóa). Trọng tâm là code intelligence trong template và cấu hình `@defer on idle`.

## Tính năng chính (theo changelog thật)

- **Template inlay hints**: `add angular template inlay hints support` — gợi ý inline trong template
- **Document Symbols cho templates**: `add Document Symbols support for Angular templates` — outline/breadcrumb/navigate trong IDE
- **Idle timeout cho defer blocks**: `Add support for idle timeout in defer blocks` — cấu hình timeout cho `on idle`
- **Liên quan (core)**: `support customization of @defer's on idle behavior`, `Support optional timeout for idle deferred triggers`, `add IdleRequestOptions support to IdleService`, `Adds warning for prefetch without main defer trigger`
- **Hỗ trợ `@Input` with transforms**: Language-service hiểu input có transform

## Ví dụ Code

### Inlay hints trong template

```typescript
// IDE hiện inlay hints cho signals/pipes trong template — bật trong VS Code settings
@Component({
  selector: 'app-demo',
  template: `
    {{ count() }}
    {{ amount | currency:'USD':'symbol' }}
  `
})
export class DemoComponent {
  count = signal(0);
  amount = signal(100);
}
```

### Document Symbols — outline template

```typescript
// Nhờ Document Symbols, Ctrl+Shift+O trong file template hiện outline:
// DemoComponent > template > @if (isVisible) > @for (row of rows)
// Click để nhảy tới block tương ứng, breadcrumb điều hướng chính xác.
@Component({
  selector: 'app-diagnostics',
  template: `
    @if (isVisible()) {
      <p>Nội dung hiển thị</p>
    }
  `
})
export class DiagnosticsComponent {
  isVisible = signal(true);
}
```

### Idle timeout cho `@defer`

```typescript
@Component({
  selector: 'app-defer-demo',
  template: `
    @defer (on idle; on idle(timeout: 5s)) {
      <app-heavy-chart />
    } @placeholder {
      <p>Đang chờ idle...</p>
    }
  `
})
export class DeferDemoComponent {}
```

> ℹ️ Nếu dùng `prefetch` mà không có main `on idle`/trigger chính, compiler-cli v22 cảnh báo `prefetch without main defer trigger`. Tùy biến sâu hơn qua `IdleService` + `IdleRequestOptions` / `provideIdle...`.

## Tính Năng Language Service (v22)

| Tính năng | Changelog |
|---------|-------------|
| **Inlay hints** | ✅ `add angular template inlay hints support` |
| **Document Symbols** | ✅ `add Document Symbols support for Angular templates` |
| **Idle timeout defer** | ✅ `Add support for idle timeout in defer blocks` |
| **`@Input` with transforms** | ✅ Language-service hiểu transform |

## Thiết Lập

```bash
# Cài Angular Language Service trong VS Code
code --install-extension Angular.ng-template
```

```json
// Bật strict mode trong tsconfig.json (migration v22 có thể tự thêm strictTemplates khi ng update)
{
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
```

## Tham khảo
- [Angular v22 changelog — language-service: inlay hints, Document Symbols, idle timeout defer](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular 22 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
