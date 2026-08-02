# linkedSignal Có Phương Thức `.set()` Trực Tiếp

## Tổng quan
Angular 22 thêm phương thức `.set()` trực tiếp cho `linkedSignal` — không còn phải gọi `.set()` thông qua `.asReadonly()` hoặc viết những cách làm vòng vo. Giờ bạn có thể đọc và ghi một linked signal từ bất cứ đâu cần.

## Tính năng chính

- **Phương thức `.set()` trực tiếp**: Không còn cần cách làm vòng vo
- **Writable theo mặc định**: `linkedSignal` giờ vừa đọc được vừa ghi được
- **Tương thích ngược**: Cách dùng `linkedSignal` hiện có vẫn hoạt động
- **Code gọn hơn**: Loại bỏ boilerplate cho các pattern ghi

## Ví dụ Code

### linkedSignal cơ bản với `.set()`

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <h2>Bộ đếm: {{ counter() }}</h2>
    <button (click)="reset()">Đặt lại</button>
    <button (click)="setToTen()">Đặt thành 10</button>
  `
})
export class CounterComponent {
  source = signal(0);
  
  // linkedSignal với .set() trực tiếp
  counter = linkedSignal(() => this.source());
  
  reset() {
    this.source.set(0); // Thay đổi source, counter tự cập nhật
  }
  
  setToTen() {
    this.counter.set(10); // Set trực tiếp! Mới trong Angular 22
  }
}
```

### Trước Angular 22 (Bắt Buộc Cách Làm Vòng Vo)

```typescript
// Angular 21 - phải dùng các pattern khó xử
@Component({
  selector: 'app-old-counter',
  template: `
    <h2>Bộ đếm: {{ counter() }}</h2>
    <button (click)="reset()">Đặt lại</button>
  `
})
export class OldCounterComponent {
  source = signal(0);
  
  // Không có .set() trực tiếp
  counter = linkedSignal(() => this.source());
  
  reset() {
    this.source.set(0); // Phải sửa source thay vì counter
  }
}
```

### Liên Kết Hai Chiều với linkedSignal

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `
    <input [value]="searchTerm()" (input)="onInput($event)" />
    <p>Đang tìm: {{ searchTerm() }}</p>
    @if (debouncedTerm() !== searchTerm()) {
      <p>Debounced: {{ debouncedTerm() }} (đang cập nhật...)</p>
    }
  `
})
export class SearchComponent {
  searchTerm = signal('');
  
  // Được tính từ source, nhưng cũng set trực tiếp được
  debouncedTerm = linkedSignal(() => this.searchTerm());
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    
    // Debounce: đặt lại sau một khoảng delay
    setTimeout(() => {
      this.debouncedTerm.set(value);
    }, 300);
  }
}
```

### linkedSignal với Options

```typescript
import { linkedSignal } from '@angular/core';

// Với kiểm tra bằng nhau (equality check)
const selection = linkedSignal({
  source: () => this.currentItem(),
  computation: (item) => ({
    ...item,
    selected: true
  }),
  equal: (a, b) => a.id === b.id
});

// Với hành vi reset
const formField = linkedSignal({
  source: () => this.formData(),
  computation: (data) => ({
    value: data.defaultValue,
    touched: false
  })
});
```

## Tham Chiếu API

| Phương thức | Mô tả | Mới trong v22 |
|--------|-------------|------------|
| `linkedSignal(() => expr)` | Tạo một linked signal có thể ghi | ✅ Thêm `.set()` |
| `.set(value)` | Đặt giá trị trực tiếp | ✅ **Mới** |
| `.update(fn)` | Cập nhật qua hàm | ✅ **Mới** |
| `.asReadonly()` | Lấy phiên bản chỉ đọc | Có sẵn |

## Migration

Không cần thay đổi gì cho các app hiện có. `.set()` mới hoàn toàn bổ sung thêm:

```typescript
// Cả hai pattern đều hoạt động trong Angular 22
const counter = linkedSignal(() => this.source());
counter.set(10);      // Mới: ghi trực tiếp
this.source.set(10);  // Có sẵn: vẫn hoạt động
```

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
