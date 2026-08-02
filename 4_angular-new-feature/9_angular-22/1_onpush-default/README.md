# OnPush Là Mặc Định Mới

## Tổng quan
Trong Angular 22, các component mặc định dùng `ChangeDetectionStrategy.OnPush` thay vì hành vi "check always" cũ. Đây là kết quả tự nhiên của định hướng zoneless, signal-first.

## Điểm chính

- **Mặc định mới**: Component không khai báo thuộc tính `changeDetection` sẽ tự động dùng `OnPush`
- **`ChangeDetectionStrategy.Eager`**: Tên mới cho mặc định "check always" cũ
- **Migration tự động**: Angular tự động thêm `Eager` vào các component hiện có khi cần
- **Hoạt động với zoneless**: OnPush quyết định view nào được check; zoneless loại bỏ zone.js làm trigger

## Ví dụ Code

### Component mới (mặc định Angular 22 - OnPush)

```typescript
// Không cần changeDetection - OnPush là mặc định
@Component({
  selector: 'app-counter',
  template: `{{ count() }}`
})
export class Counter {
  count = signal(0); // OnPush + signals: cập nhật tự hoạt động
}
```

### Component cũ (migration thêm Eager)

```typescript
// Migration thêm Eager để giữ hành vi cũ
@Component({
  selector: 'app-legacy',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `…`
})
export class Legacy {}
```

### Cấu hình app zoneless

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
};
```

## Vì Sao Điều Này Quan Trọng

1. **Hiệu năng**: Component mới được tận hưởng change detection hiệu năng cao miễn phí
2. **Đường migration**: Các marker `Eager` đóng vai trò danh sách việc cần làm để dọn dẹp từng bước
3. **Signal-first**: Khi dùng signals, bạn thường không cần nghĩ về change detection
4. **Tương thích ngược**: Các app hiện có vẫn hoạt động nhờ migration tự động

## Chiến Lược Migration

```bash
# Chạy migration tự động
ng generate @angular/core:change-detection-migration
```

Sau khi migration, tìm kiếm `Eager` trong codebase để xác định các component cần dọn dẹp:

```typescript
// Mỗi kết quả Eager là một ứng viên để chuyển sang OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.Eager // ← Xóa đi và dùng signals
})
```

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
