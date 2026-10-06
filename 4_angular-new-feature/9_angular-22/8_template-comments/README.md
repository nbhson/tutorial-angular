# Comment Trong HTML Element

## Tổng quan
Đính chính: comment kiểu HTML `<!-- -->` **luôn hợp lệ** trong Angular templates từ trước tới nay — không phải mới v22. Feature thật trong Angular 22 là hỗ trợ comment kiểu **JS/TS (`//` và `/* */`) ngay bên trong thẻ mở của HTML element**, để document properties và bindings.

## Tính năng chính

- **`<!-- -->` không phải mới**: Luôn dùng được trong templates
- **Mới v22: `//` và `/* */` trong thẻ mở**: Comment ngay tại property/binding level
- **Document bindings**: Giải thích từng input/binding phức tạp
- **Hỗ trợ IDE**: VS Code comment toggling hoạt động với cú pháp mới

## Ví dụ Code

### Feature mới v22: Comment trong thẻ mở

```typescript
@Component({
  selector: 'app-demo',
  template: `
    <div
      // comment trên 1 dòng — hợp lệ từ v22
      /* comment block — hợp lệ từ v22 */
      attr1="value1"
      /*
         comment nhiều dòng
         giải thích binding dưới
      */
      [attr2]="value2"
    ></div>
  `
})
export class DemoComponent {}
```

### Document properties và bindings

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <app-user-card
      // ID hiển thị, lấy từ route param
      [userId]="userId()"
      /* TODO: chuyển sang signal input transform khi lên v23 */
      [showAvatar]="showAvatar()"
    />
  `
})
export class UserListComponent {
  userId = signal(1);
  showAvatar = signal(true);
}
```

### `<!-- -->` — vốn đã hợp lệ từ trước (không phải mới)

```typescript
@Component({
  selector: 'app-demo',
  template: `
    <h1>Component của tôi</h1>
    <!-- Đây là comment HTML — đã hợp lệ từ trước v22 -->
    <p>Một số nội dung</p>
    @for (user of users(); track user.id) {
      <!-- Comment trong control flow cũng đã hợp lệ từ trước -->
      <li>{{ user.name }}</li>
    }
  `
})
export class DemoComponent {
  users = signal<User[]>([]);
}
```

## Trước vs Sau

```typescript
// Trước Angular 22 - // và /* */ trong thẻ mở gây lỗi
@Component({
  template: `
    <div
      // Điều này gây lỗi compilation trước v22
      attr1="value1"
    ></div>
  `
})

// Angular 22 - // và /* */ trong thẻ mở giờ hợp lệ
@Component({
  template: `
    <div
      // Giờ đây hợp lệ — document ngay tại binding
      attr1="value1"
      /* block comment cũng hợp lệ */
      [attr2]="value2"
    ></div>
  `
})
```

## Lợi Ích

| Use Case | Mô tả |
|----------|-------------|
| **Tài liệu hóa bindings** | Giải thích từng property/binding phức tạp ngay tại chỗ |
| **TODO inline** | Nhắc nhở công việc tương lai sát với code liên quan |
| **Cộng tác + AI agents** | Ghi chú cho đồng đội và coding agents hiểu intent |
| **Tổ chức code** | Tách nhóm attributes dài bằng comment mô tả |

## Tham khảo
- [Angular v22 changelog — Support comments in html element](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular 22 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
