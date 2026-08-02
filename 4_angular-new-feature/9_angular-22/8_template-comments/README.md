# Comment Trong Template

## Tổng quan
Angular 22 bổ sung hỗ trợ comment trong templates. Nghe có vẻ nhỏ nhặt, nhưng nó lấp đầy một khoảng trống đã tồn tại từ đầu.

## Tính năng chính

- **Comment kiểu HTML**: Dùng `<!-- comment -->` trong templates
- **Hoạt động với control flow**: Comment bên trong các block `@if`, `@for`, `@switch`
- **Hiển thị có điều kiện**: Hiện/ẩn comment dựa trên điều kiện
- **Không tốn chi phí runtime**: Comment bị loại bỏ khỏi production builds
- **Hỗ trợ IDE**: Tô màu cú pháp (syntax highlighting) và định dạng

## Ví dụ Code

### Comment Template Cơ Bản

```typescript
@Component({
  selector: 'app-demo',
  template: `
    <h1>Component của tôi</h1>
    <!-- Đây là comment - hiện trong dev, loại bỏ trong prod -->
    <p>Một số nội dung</p>
    <!-- TODO: Thêm form validation sau -->
    <form>
      <input type="text" />
    </form>
  `
})
export class DemoComponent {}
```

### Comment Trong Control Flow

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      @for (user of users(); track user.id) {
        <!-- Mục user với avatar -->
        <li>
          <img [src]="user.avatar" [alt]="user.name" />
          <span>{{ user.name }}</span>
        </li>
        
        <!-- Dấu phân cách giữa các mục -->
        @if (!$last) {
          <li class="separator"></li>
        }
      } @empty {
        <!-- Trạng thái không có user -->
        <li class="empty">Không tìm thấy user</li>
      }
    </ul>
  `
})
export class UserListComponent {
  users = signal<User[]>([]);
}
```

### Comment Có Điều Kiện với @if

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- DEBUG: Bỏ comment để hiện thông tin debug -->
      <!-- @if (debugMode()) {
        <pre>{{ state() | json }}</pre>
      } -->
      
      <h1>Dashboard</h1>
      
      <!-- 
        TODO: Triển khai các tính năng sau:
        - Thông báo real-time
        - Xuất dữ liệu
        - Tùy chọn người dùng
      -->
      
      <app-stats />
      <app-charts />
    </div>
  `
})
export class DashboardComponent {
  debugMode = signal(false);
  state = signal({});
}
```

### Comment Lồng Nhau

```typescript
@Component({
  selector: 'app-complex',
  template: `
    <div>
      <!-- 
        Cấu trúc layout:
        Header -> Main Content -> Footer
        
        Tác giả: John Doe
        Cập nhật lần cuối: 2025-01-15
      -->
      
      <!-- Phần Header -->
      <header>
        <nav>
          <!-- Navigation items được định nghĩa trong NavComponent -->
        </nav>
      </header>
      
      <!-- Nội dung Chính -->
      <main>
        <!-- Nội dung hiển thị dựa trên route hiện tại -->
        <router-outlet />
      </main>
      
      <!-- Phần Footer -->
      <footer>
        <app-footer />
      </footer>
    </div>
  `
})
export class ComplexComponent {}
```

## Trước vs Sau

```typescript
// Trước Angular 22 - Không cho phép comment
@Component({
  template: `
    <div>
      <!-- Điều này gây lỗi compilation -->
      <p>Nội dung</p>
    </div>
  `
})

// Angular 22 - Comment hoạt động hoàn hảo
@Component({
  template: `
    <div>
      <!-- Giờ đây hợp lệ -->
      <p>Nội dung</p>
    </div>
  `
})
```

## Lợi Ích

| Use Case | Mô tả |
|----------|-------------|
| **Tài liệu hóa** | Giải thích logic template phức tạp |
| **Debugging** | Comment tạm các phần trong lúc phát triển |
| **Cộng tác** | Để lại ghi chú cho đồng đội |
| **Tổ chức code** | Đánh dấu các phần bằng tiêu đề mô tả |
| **Theo dõi TODO** | Nhắc nhở inline cho công việc tương lai |

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
