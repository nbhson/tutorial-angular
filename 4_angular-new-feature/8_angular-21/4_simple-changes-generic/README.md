# 4. SimpleChanges là Generic Type (Angular 21)

## Tổng quan

Trong Angular 21, `SimpleChanges` đã được cập nhật thành **generic type**, cho phép developer định nghĩa rõ ràng kiểu dữ liệu cho từng `@Input()` property. Previously, `SimpleChange` dùng `any` cho `previousValue` và `currentValue`, không có compile-time type checking.

## Tại sao cần thay đổi?

Trước Angular 21:

```typescript
ngOnChanges(changes: SimpleChanges) {
  // changes.age.currentValue — type: any
  // Không có type safety → runtime errors tiềm ẩn
  const newAge = changes.age.currentValue; // any
}
```

Sau Angular 21:

```typescript
ngOnChanges(changes: SimpleChanges<User>) {
  // changes.age.currentValue — type: number ✅
  // Compile-time error nếu accessed sai type
  const newAge = changes.age.currentValue; // number
}
```

## Ví dụ chi tiết

### Interface Model

```typescript
export interface User {
  userName: string;
  age: number;
}
```

### Component Class

```typescript
@Component({
  selector: 'app-user-info',
  template: `
    <h2>{{ userName }}</h2>
    <p>Tuổi: {{ age }}</p>
    <button (click)="birthday()">🎉 Sinh nhật!</button>
  `
})
export class UserInfoComponent {
  @Input({ required: true }) userName!: string;
  @Input({ required: true }) age!: number;

  // SimpleChanges<User> — generic type parameter
  ngOnChanges(changes: SimpleChanges<User>) {
    if (changes.age) {
      const newAge = changes.age.currentValue;    // type: number
      const oldAge = changes.age.previousValue;   // type: number

      if (oldAge !== undefined) {
        const diff = newAge - oldAge;
        console.log(`Age increased by ${diff} years`);
      }
    }

    if (changes.userName) {
      const newName = changes.userName.currentValue;  // type: string
      console.log(`Name changed to: ${newName}`);
    }
  }
}
```

### So sánh trước và sau

#### Trước Angular 21

```typescript
// Không có type safety
ngOnChanges(changes: SimpleChanges) {
  if (changes.age) {
    // TypeScript không biết age là number
    // Cần cast thủ công
    const newAge = changes.age.currentValue as number;
    const oldAge = changes.age.previousValue as number;
    const diff = newAge - oldAge;
    console.log(`Age increased by ${diff} years`);
  }
}
```

#### Sau Angular 21

```typescript
// Type-safe — không cần cast
ngOnChanges(changes: SimpleChanges<User>) {
  if (changes.age) {
    const newAge = changes.age.currentValue;  // tự động type: number
    const oldAge = changes.age.previousValue; // tự động type: number
    const diff = newAge - oldAge;             // không cần cast
    console.log(`Age increased by ${diff} years`);
  }
}
```

## Lợi ích

1. **Compile-time type checking** — Phát hiện lỗi sớm khi code
2. **Không cần type assertion** (`as number`, `as string`)
3. **Better IDE support** — Autocomplete chính xác hơn
4. **Code cleaner** — Không còn `as Type` casts

## Best Practices

1. **Define interface cho Input properties** — Để dùng generic type parameter
2. **Luôn dùng `SimpleChanges<Interface>`** — Thay vì `SimpleChanges` thường
3. **Kiểm tra `changes.inputName` trước khi truy cập** — Vì input có thể chưa thay đổi

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular ngOnChanges API](https://angular.dev/api/core/OnChanges)