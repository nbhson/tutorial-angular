# Cải Thiện Compiler và Type-Safety

## Tổng quan
Angular 22 tăng cường type safety trên toàn framework và dọn dẹp các đường đi nội bộ của compiler.

## Tính năng chính

- **Type checking chặt chẽ hơn**: Tích hợp TypeScript tốt hơn
- **Tối ưu compiler**: Biên dịch nhanh hơn với các đường đi nội bộ sạch hơn
- **Suy luận kiểu cho signals**: Cải thiện suy luận kiểu (type inference) cho signals
- **Kiểm tra kiểu template**: Nâng cao diagnostics template

## Ví dụ Code

### Kiểm Tra Kiểu Template Chặt Chẽ

```typescript
// Angular 22: Kiểm tra kiểu template chặt chẽ hơn được bật theo mặc định
@Component({
  selector: 'app-strict-demo',
  template: `
    <!-- ✅ Type-safe: Angular biết đây là số -->
    <span>{{ count() }}</span>
    
    <!-- ❌ Lỗi kiểu: Angular phát hiện ở thời điểm compile -->
    <!-- <span>{{ count() + "not a number" }}</span> -->
    
    <!-- ✅ Type-safe: Kiểm tra null đúng cách -->
    @if (user()) {
      <span>{{ user()!.name }}</span>
    }
  `
})
export class StrictDemoComponent {
  count = signal<number>(0);
  user = signal<User | null>(null);
}
```

### Suy Luận Kiểu Cho Signals

```typescript
// Angular 22: Suy luận kiểu tốt hơn cho các kiểu signal phức tạp
interface User {
  id: number;
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
  };
}

@Component({
  selector: 'app-user-profile',
  template: `
    <!-- Type safety đầy đủ với các thuộc tính lồng nhau -->
    <div [class]="user().preferences.theme">
      <h2>{{ user().name }}</h2>
      <p>{{ user().email }}</p>
      <span>Theme: {{ user().preferences.theme }}</span>
    </div>
  `
})
export class UserProfileComponent {
  // Angular 22: Suy luận kiểu đầy đủ cho các signal phức tạp
  user = signal<User>({
    id: 1,
    name: 'John',
    email: 'john@example.com',
    preferences: { theme: 'dark', language: 'en' }
  });
}
```

### Event Binding Chặt Chẽ

```typescript
@Component({
  selector: 'app-form',
  template: `
    <!-- Angular 22: Suy luận kiểu event đúng cách -->
    <input (input)="onInput($event)" />
    <button (click)="onClick($event)">Gửi</button>
    <form (submit)="onSubmit($event)">
      <input type="text" />
    </form>
  `
})
export class FormComponent {
  // $event được định kiểu đúng là InputEvent
  onInput(event: InputEvent) {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
  }

  // $event được định kiểu đúng là MouseEvent
  onClick(event: MouseEvent) {
    console.log(event.clientX, event.clientY);
  }

  // $event được định kiểu đúng là SubmitEvent
  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log('Form đã gửi');
  }
}
```

### Dependency Injection Có Kiểu

```typescript
// Angular 22: Type safety tốt hơn cho injection tokens
import { InjectionToken, inject } from '@angular/core';

interface AppConfig {
  apiUrl: string;
  timeout: number;
  debug: boolean;
}

const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// Sử dụng type-safe
@Component({
  selector: 'app-config-demo',
  template: `
    <p>API URL: {{ config.apiUrl }}</p>
    <p>Timeout: {{ config.timeout }}ms</p>
  `
})
export class ConfigDemoComponent {
  private config = inject(APP_CONFIG);
  // config được định kiểu đầy đủ là AppConfig
  
  constructor() {
    // TypeScript thực thi interface
    console.log(this.config.apiUrl);    // ✅ string
    console.log(this.config.timeout);   // ✅ number
    console.log(this.config.debug);     // ✅ boolean
  }
}
```

### Type Safety Cho Component Generic

```typescript
// Angular 22: Hỗ trợ generic type nâng cao
@Component({
  selector: 'app-list',
  template: `
    @for (item of items(); track getItemId(item)) {
      <div [class.selected]="isSelected(item)">
        <ng-content [select]="getItemTemplate()"></ng-content>
      </div>
    }
  `
})
export class ListComponent<T extends { id: number }> {
  items = signal<T[]>([]);
  selectedId = signal<number | null>(null);
  
  isSelected(item: T): boolean {
    return this.selectedId() === item.id;
  }
  
  getItemId(item: T): number {
    return item.id;
  }
}
```

## Cải Thiện Type Safety

| Tính năng | Trước | Sau |
|---------|--------|-------|
| **Signal types** | Suy luận cơ bản | Hỗ trợ generic đầy đủ |
| **Template checking** | Cảnh báo tùy chọn | Chặt chẽ theo mặc định |
| **Event types** | Thường là `any` | Định kiểu `$event` đúng |
| **DI tokens** | Định kiểu lỏng lẻo | Thực thi interface |
| **Generic components** | Hỗ trợ hạn chế | Suy luận kiểu nâng cao |

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
