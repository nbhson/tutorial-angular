# 6. NgClass to Class Binding — Migration Schematic (Angular 21)

## Tổng quan

Angular 21 cung cấp **migration schematic** tự động chuyển đổi `NgClass` directive thành `class` binding trong templates. Việc dùng `NgClass` không còn được recommended — sử dụng `[class]` binding trực tiếp giúp code ngắn hơn và bundle nhỏ hơn (không cần import `NgClass`).

## Migration Command

```bash
ng generate @angular/core:ngclass-to-class
```

Lệnh này tự động:
1. Tìm tất cả file sử dụng `NgClass`
2. Thay thế `[ngClass]` bằng `[class]`
3. Xóa import `NgClass` khỏi component

## Ví dụ

### Trước Migration

```typescript
@Component({
  selector: 'app-button',
  imports: [NgClass],
  template: `
    <button [ngClass]="{
              'isNew': isNew()
    }">Click me</button>  <!-- trước migration -->
  `,
})
export class ButtonComponent {
  protected readonly isNew = signal(true);
}
```

### Sau Migration

```typescript
@Component({
  selector: 'app-button',
  // imports: [NgClass] — không cần nữa!
  template: `
    <button [class]="{
              'isNew': isNew()
    }">Click me</button>  <!-- sau migration -->
  `,
})
export class ButtonComponent {
  protected readonly isNew = signal(true);
}
```

## Phân tích thay đổi

### 1. Import bị xóa

```typescript
// Trước
@Component({
  imports: [NgClass],  // ← Cần import
})

// Sau
@Component({
  // imports: [NgClass] — không cần nữa!
})
```

### 2. Template binding thay đổi

```html
<!-- Trước -->
<button [ngClass]="{ 'isActive': isActive() }">Click</button>

<!-- Sau -->
<button [class]="{ 'isActive': isActive() }">Click</button>
```

### 3. Class-based condition (hoạt động tương tự)

```html
<!-- Trước -->
<div [ngClass]="{ 'highlight': isHighlighted(), 'bold': isBold() }"></div>

<!-- Sau -->
<div [class]="{ 'highlight': isHighlighted(), 'bold': isBold() }"></div>
```

## Lợi ích

1. **Bundle size giảm hơn** — Không import `NgClass` directive
2. **Code ngắn hơn** — Ít boilerplate code
3. **Đọc dễ hơn** — `[class]` binding rõ ràng hơn `[ngClass]`
4. **Consistency** — Đồng nhất với Angular style binding pattern

## Best Practices

1. **Chạy schematic trên project lớn** — Tự động migrate tất cả `NgClass` usages
2. **Kiểm tra kết quả sau migration** — Đảm bảo không có edge cases bị miss
3. **Dùng `[class]` binding** thay vì `[ngClass]` cho project mới
4. **Xóa import `NgClass`** thủ công nếu không chạy schematic

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular Class Binding](https://angular.dev/guide/templates/class-binding)