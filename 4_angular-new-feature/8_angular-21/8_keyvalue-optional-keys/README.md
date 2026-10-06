# 8. KeyValue Pipe — Typing cho Optional Keys (Angular 21)

## Tổng quan

Angular 21 cải thiện **typing** của `KeyValuePipe`: `KeyValue` interface giờ biểu diễn đúng các object có **optional keys** (ví dụ `Partial<T>` hay `{ a?: string }`). Trước đây type của pipe không phản ánh trường hợp key có thể vắng mặt, gây khó khi dùng với strict templates.

> ⚠️ Lưu ý: thay đổi này là về **kiểu dữ liệu (typing)**, không phải thêm callback `(key) => ...` cho pipe. `keyvalue` pipe vẫn nhận `(a, b) => ...` compare function như cũ.

## Ví dụ

### Trước Angular 21 — Typing không bao phủ optional keys

```typescript
interface User {
  name?: string;   // optional key
  age?: number;
}

// Template — vẫn chạy, nhưng type của item.key/item.value
// không phản ánh đúng optional keys dưới strictTemplates
<div *ngFor="let item of user | keyvalue">
  {{ item.key }}: {{ item.value }}
</div>
```

### Sau Angular 21 — Typing đúng cho optional keys

```typescript
// Kiểu KeyValue giờ tương thích với Partial<T> / optional properties,
// nên strict template + IDE autocomplete hoạt động chính xác hơn.
user = signal<Partial<User>>({ name: 'Nguyen Van A' });
```

```html
<!-- Không đổi cách dùng — chỉ type chính xác hơn -->
<div *ngFor="let item of user() | keyvalue">
  <strong>{{ item.key }}</strong>: {{ item.value }}
</div>
```

## Ví dụ chi tiết

### Component

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <h2>User Profile</h2>
    <div *ngFor="let item of user() | keyvalue">
      <strong>{{ item.key }}</strong>: {{ item.value }}
    </div>
  `
})
export class UserProfileComponent {
  user = signal<Partial<User>>({
    name: 'Nguyen Van A',
    age: 25,
    // isActive / email có thể vắng mặt — type vẫn đúng
  });
}
```

## Lợi ích

1. **Type-safe với `Partial<T>`** — Không cần cast khi object thiếu key
2. **Strict templates ít báo sai** — IDE hiểu đúng `item.key`/`item.value`
3. **Backward compatible** — Cách dùng pipe trong template không đổi

## Best Practices

1. **Khai báo model bằng `Partial<T>`** khi field có thể vắng mặt
2. **Không đổi compare function** đang hoạt động — signature `(a, b) => number` giữ nguyên
3. **Bật `strictTemplates`** để hưởng lợi typing mới

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular KeyValuePipe API](https://angular.dev/api/common/KeyValuePipe)
