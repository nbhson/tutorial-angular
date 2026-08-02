# Language Service và DevTools

## Tổng quan
Angular 22 mang đến những cải tiến đáng kể cho Angular Language Service và DevTools, mang lại trải nghiệm developer tốt hơn với khả năng debugging nâng cao, profiling hiệu năng và code intelligence.

## Tính năng chính

- **Cải tiến Language Service**: Autocomplete, diagnostics và refactoring tốt hơn
- **Cập nhật DevTools**: Khả năng debugging nâng cao
- **Trực quan hóa signals**: Xem dependencies của signals theo thời gian thực
- **Profiling hiệu năng**: Theo dõi thời gian render của component
- **Debugging template**: Cải thiện thông báo lỗi template

## Ví dụ Code

### Tính Năng Language Service

```typescript
// Angular Language Service cung cấp gợi ý thông minh
@Component({
  selector: 'app-demo',
  template: `
    <!-- Autocomplete cho signals -->
    {{ count() }}
    
    <!-- Autocomplete cho thuộc tính component -->
    {{ userName() }}
    
    <!-- Đối số pipe type-safe -->
    {{ amount | currency:'USD':'symbol' }}
  `
})
export class DemoComponent {
  count = signal(0);
  userName = signal('John');
  amount = signal(100);
}
```

### DevTools Signal Inspector

```typescript
// DevTools giờ hiển thị trực quan hóa signal graph
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-inspectable',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <p>Status: {{ status() }}</p>
  `
})
export class InspectableComponent {
  // DevTools hiển thị chúng dưới dạng dependency graph
  count = signal(0);           // Source signal
  doubled = computed(() => this.count() * 2);  // Phụ thuộc vào count
  status = computed(() =>      // Phụ thuộc vào count
    this.count() > 10 ? 'High' : 'Normal'
  );
  
  increment() {
    this.count.update(c => c + 1);
    // DevTools hiển thị: count đã cập nhật → doubled tính lại → status tính lại
  }
}
```

### Profiling Hiệu Năng với DevTools

```typescript
// DevTools Component Profiler theo dõi hiệu năng render
@Component({
  selector: 'app-data-table',
  template: `
    @for (row of visibleRows(); track row.id) {
      <app-table-row [data]="row" />
    }
  `
})
export class DataTableComponent {
  allRows = signal<Row[]>([]);
  
  // DevTools hiển thị khi nào cái này tính toán lại
  visibleRows = computed(() => 
    this.allRows().filter(r => r.visible)
  );
  
  // DevTools profiler hiển thị:
  // - Thời gian khởi tạo component
  // - Chu kỳ change detection
  // - Tần suất cập nhật signal
  // - Thời gian render mỗi lần cập nhật
}
```

### Diagnostics Language Service

```typescript
// Angular Language Service phát hiện các lỗi phổ biến

@Component({
  selector: 'app-diagnostics',
  template: `
    <!-- ✅ Language Service biết cái này hợp lệ -->
    @if (isVisible()) {
      <p>Nội dung hiển thị</p>
    }
    
    <!-- ✅ Phát hiện gọi signal đúng cách -->
    <span>{{ counter() }}</span>
    
    <!-- ✅ Phát hiện thiếu dấu () khi gọi signal -->
    <!-- <span>{{ counter }}</span> → Cảnh báo: Ý bạn là counter()? -->
    
    <!-- ✅ Kiểm tra kiểu template -->
    <!-- {{ undefined.property }} → Lỗi: Thuộc tính 'property' không tồn tại -->
  `
})
export class DiagnosticsComponent {
  isVisible = signal(true);
  counter = signal(0);
}
```

### Hỗ Trợ Refactoring

```typescript
// Language Service hỗ trợ refactoring an toàn

// Đổi tên signal → tự động cập nhật mọi tham chiếu trong template
// Trước:
count = signal(0);        // Template: {{ count() }}

// Sau khi đổi tên thành "itemCount":
itemCount = signal(0);    // Template: {{ itemCount() }}  ← Tự động cập nhật!

// Extract method refactoring trong templates
// Tách các biểu thức phức tạp thành các method dễ đọc
@Component({
  template: `
    <!-- Trước: Biểu thức inline phức tạp -->
    <!-- {{ items().filter(i => i.active).map(i => i.name).join(', ') }} -->
    
    <!-- Sau refactoring: Gọi method sạch sẽ -->
    {{ activeItemNames() }}
  `
})
export class RefactorDemoComponent {
  items = signal<Item[]>([]);
  
  activeItemNames = computed(() => 
    this.items()
      .filter(i => i.active)
      .map(i => i.name)
      .join(', ')
  );
}
```

## Tính Năng DevTools

| Tính năng | Mô tả |
|---------|-------------|
| **Signal Inspector** | Xem giá trị signal và dependency graph |
| **Component Profiler** | Theo dõi thời gian render và chu kỳ change detection |
| **State Explorer** | Kiểm tra state của component theo thời gian thực |
| **Router Inspector** | Trực quan hóa route tree và điều hướng |
| **Dependency Graph** | Xem hệ thống phân cấp component và injection tree |
| **Template Debugger** | Đi qua từng bước quá trình render template |

## Tính Năng Language Service

| Tính năng | Mô tả |
|---------|-------------|
| **Autocomplete** | Gợi ý thông minh cho signals, pipes, directives |
| **Diagnostics** | Phát hiện lỗi theo thời gian thực trong templates |
| **Hover Info** | Thông tin kiểu khi hover |
| **Go to Definition** | Điều hướng tới định nghĩa component/directive |
| **Find References** | Xác định mọi nơi dùng components/pipes |
| **Quick Fixes** | Đề xuất tự động cho các vấn đề phổ biến |

## Thiết Lập

```bash
# Cài Angular Language Service trong VS Code
code install Angular.ng-template

# Bật strict mode trong tsconfig.json
{
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true
  }
}
```

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
