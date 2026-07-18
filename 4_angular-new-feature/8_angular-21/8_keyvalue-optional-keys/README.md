# 8. KeyValue Pipe — Optional Keys (Angular 21)

## Tổng quan

Angular 21 cho phép **key và value là optional** khi dùng `KeyValuePipe`. Previously, bạn phải truyền cả key và value vào hàm callback. Từ Angular 21, bạn có thể chỉ dùng **key alone** hoặc **key + value** tùy nhu cầu.

## Ví dụ

### KeyValuePair Interface

```typescript
interface KeyValuePair {
  key: string;
  value: string | number | boolean | object | null | undefined;
}
```

### Trước Angular 21 — Luôn cần cả key và value

```typescript
// Template
<div *ngFor="let item of user | keyvalue">
  {{ item.key }}: {{ item.value }}
</div>

// Component — callback phải có cả 2 params
transform(items: any[], callback: (key: string, value: any) => any): any[] {
  return items.filter(([key, value]) => callback(key, value));
}
```

### Sau Angular 21 — Key là optional

```typescript
// Template — có thể dùng key alone
<div *ngFor="let item of user | keyvalue">
  {{ item.key }}: {{ item.value }}
</div>

// Component — callback chỉ cần key
transform(items: any[], callback: (key: string) => any): any[] {
  return items.filter(([key]) => callback(key));
}
```

## Ví dụ chi tiết

### Component

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <h2>User Profile</h2>

    <!-- Dùng cả key và value -->
    <div *ngFor="let item of user | keyvalue">
      <strong>{{ item.key }}</strong>: {{ item.value }}
    </div>

    <h3>Chỉ hiển thị boolean fields</h3>
    <!-- Chỉ dùng key để filter -->
    <div *ngFor="let item of user | keyvalue : onlyBooleanKeys">
      {{ item.key }}: {{ item.value }}
    </div>
  `
})
export class UserProfileComponent {
  user = signal({
    name: 'Nguyen Van A',
    age: 25,
    isActive: true,
    isAdmin: false,
    email: 'a@example.com'
  });

  // Chỉ dùng key — value không cần thiết
  onlyBooleanKeys(key: string): boolean {
    return ['isActive', 'isAdmin'].includes(key);
  }
}
```

### So sánh trước và sau

#### Trước Angular 21

```typescript
// Luôn cần cả key và value parameters
onlyBooleanKeys(key: string, value: any): boolean {
  return typeof value === 'boolean';
}
```

#### Sau Angular 21

```typescript
// Chỉ dùng key — value là optional
onlyBooleanKeys(key: string): boolean {
  return ['isActive', 'isAdmin'].includes(key);
}
```

## Lợi ích

1. **Code ngắn hơn** — Không cần parameter không dùng
2. **Readability** — Rõ ràng hơn khi chỉ cần key
3. **Flexibility** — Tùy chọn dùng key hoặc key + value

## Best Practices

1. **Dùng key alone** khi filter chỉ dựa vào key name
2. **Dùng key + value** khi cần access cả hai
3. **Không thay đổi callback signature** đang hoạt động — backward compatible

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular KeyValuePipe API](https://angular.dev/api/common/KeyValuePipe)