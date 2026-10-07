# Angular Style Guide (v22)

> Nguồn: https://angular.dev/style-guide

## Tổng quan
Quy tắc đặt tên + cấu trúc chuẩn để AI và team sinh code nhất quán: standalone-first, signals-first, `inject()`.

## Điểm chính
- Component selector: prefix app + kebab-case (`app-user-card`).
- File/class: `user-card.ts` → `UserCard`; 1 component/1 file; barrel `index.ts` cho libs.
- Dùng `input()`/`output()`/`model()` thay decorators `@Input/@Output`; `inject()` thay constructor DI.
- Template: `@if/@for/@switch/@let/@defer`, `track` bắt buộc trong `@for`.

## Ví dụ Code
```typescript
// ✅ Chuẩn v22
@Component({ selector: 'app-user-card' })
export class UserCard {
  private api = inject(UserApi);
  user = input.required<User>();
  deleted = output<number>();
}
```

```html
@for (u of users(); track u.id) { <app-user-card [user]="u" /> }
```

## Tham khảo
- [Style Guide](https://angular.dev/style-guide)
