# 7. NgStyle to Style Binding — Migration Schematic (Angular 21)

## Tổng quan

Tương tự `NgClass`, Angular 21 cung cấp **migration schematic** tự động chuyển đổi `NgStyle` directive thành `style` binding. Đây là một phần trong chiến lược "move to built-in directives" của Angular.

## Migration Command

```bash
ng generate @angular/core:ngstyle-to-style
```

## Ví dụ

### Trước Migration

```typescript
@Component({
  selector: 'app-dynamic',
  imports: [NgStyle],
  template: `
    <div [ngStyle]="{ 'background-color': bgColor(), 'font-size': fontSize() + 'px' }">
      Dynamic styles
    </div>
  `,
})
export class DynamicComponent {
  bgColor = signal('#ff0000');
  fontSize = signal(16);
}
```

### Sau Migration

```typescript
@Component({
  selector: 'app-dynamic',
  // imports: [NgStyle] — không cần nữa!
  template: `
    <div [style]="{ 'background-color': bgColor(), 'font-size': fontSize() + 'px' }">
      Dynamic styles
    </div>
  `,
})
export class DynamicComponent {
  bgColor = signal('#ff0000');
  fontSize = signal(16);
}
```

## Phân tích thay đổi

### 1. Import bị xóa

```typescript
// Trước
@Component({
  imports: [NgStyle],  // ← Cần import
})

// Sau
@Component({
  // imports: [NgStyle] — không cần nữa!
})
```

### 2. Template binding thay đổi

```html
<!-- Trước -->
<div [ngStyle]="{ 'color': textColor(), 'margin': '10px' }">Hello</div>

<!-- Sau -->
<div [style]="{ 'color': textColor(), 'margin': '10px' }">Hello</div>
```

### 3. Style property binding (không cần object)

```html
<!-- Trước -->
<div [ngStyle]="{ 'background-color': color() }">Background</div>

<!-- Sau -->
<div [style.background-color]="color()">Background</div>
```

## Lợi ích

1. **Bundle size giảm hơn** — Không import `NgStyle` directive
2. **Code ngắn hơn** — Ít boilerplate code
3. **Đọc dễ hơn** — `[style]` binding rõ ràng hơn `[ngStyle]`
4. **Type-safe** — TypeScript tự kiểm tra style property names

## Best Practices

1. **Chạy schematic trên project lớn** — Tự động migrate tất cả `NgStyle` usages
2. **Kiểm tra kết quả sau migration** — Đặc biệt với computed style values
3. **Dùng `[style]` binding** thay vì `[ngStyle]` cho project mới
4. **Tham khảo Angular Style Binding Guide** cho migration chi tiết

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular Style Binding Guide](https://angular.dev/guide/templates/style-binding)
- [ngstyle-to-style migration — angular.dev](https://angular.dev/reference/migrations/ngstyle-to-style)