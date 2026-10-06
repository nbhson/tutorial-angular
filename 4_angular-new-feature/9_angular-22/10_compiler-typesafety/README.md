# Cải Thiện Compiler và Type-Safety

## Tổng quan
Angular 22 tăng cường type safety ở tầng template expression — nổi bật là 2 feat compiler: **safe-navigation narrowing** và **optional-chaining trả `undefined`**. Kèm theo là các diagnostic chặt hơn (có migration tắt tạm 2 rules mới nếu nhiễu).

## Tính năng chính (theo changelog thật)

- **Safe navigation narrowing nullables**: `allow safe navigation to correctly narrow down nullables` — `?.` thu hẹp kiểu đúng trong type-check
- **Optional chaining trả `undefined`**: `Angular expressions with optional chaining returns undefined` — nhất quán với JS, kèm migration `safe optional chaining` (idempotent)
- **Diagnostics mới bật theo mặc định**: `nullishCoalescingNotNullable` + `optionalChainNotNullable` có thể báo trên project cũ — migration `ng update` có option tắt tạm
- **Chặt chẽ hóa bindings**: `data-` attributes không còn bind inputs/outputs; throw khi trùng inputs/outputs; throw khi dùng `in` trong template expression; type-check `for` loops invalid
- **NG8023**: Compile-time diagnostic khi duplicate selectors

## Ví dụ Code

### Safe-navigation narrowing

```typescript
@Component({
  selector: 'app-strict-demo',
  template: `
    <!-- v22: ?. thu hẹp nullable đúng — không còn báo sai sau khi check -->
    @if (user()?.address?.city) {
      <span>{{ user()?.address?.city }}</span>
    }
  `
})
export class StrictDemoComponent {
  user = signal<User | null>(null);
}
```

### Optional chaining trả `undefined`

```typescript
@Component({
  selector: 'app-chain-demo',
  template: `
    <!-- v22: a?.b trả undefined (như JS) thay vì null — code so sánh == null vẫn ổn, === null cần sửa -->
    <span>{{ user()?.name }}</span>
  `
})
export class ChainDemoComponent {
  user = signal<User | null>(null);
}
```

### Diagnostics mới sau khi lên v22

```typescript
// Nếu project cũ báo ồ ạt 2 rules mới, có thể tắt tạm trong tsconfig:
// {
//   "angularCompilerOptions": {
//     "nullishCoalescingNotNullable": false,
//     "optionalChainNotNullable": false
//   }
// }
// Migration ng update v22 đã hỗ trợ tắt tạm + safe-optional-chaining idempotent.
```

### Bindings bị siết (breaking cần biết)

```typescript
// ❌ Trước v22 lỡ bind được, v22 throw:
// <div [data-foo]="x"> — data- attributes không bind inputs/outputs nữa
// inputs/outputs trùng nhau — throw lúc compile (NG8023 cho selectors trùng)
// `in` trong template expression — throw
```

## Cải Thiện Type Safety

| Tính năng | Changelog v22 |
|---------|-------|
| **Safe navigation narrowing** | ✅ `allow safe navigation to correctly narrow down nullables` |
| **Optional chaining `undefined`** | ✅ `Angular expressions with optional chaining returns undefined` |
| **Diagnostics `nullishCoalescingNotNullable`/`optionalChainNotNullable`** | ✅ Bật mặc định, có migration tắt tạm |
| **Duplicate selectors (NG8023)** | ✅ Compile-time error mới |
| **`data-` / trùng IO / `in` / for invalid** | ✅ Throw/validate chặt hơn |

## Tham khảo
- [Angular v22 changelog — compiler: safe navigation narrowing, optional chaining undefined, NG8023](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular 22 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
