# WebMCP — MCP Chạy Trong Trình Duyệt

## Tổng quan
Angular 22 cung cấp client WebMCP. Bạn có thể expose signals, models hoặc actions cho AI agent ngay trong trình duyệt — không cần glue phía server.

## Tính năng chính

- **MCP dựa trên trình duyệt**: MCP chạy trực tiếp trong trình duyệt, không cần server
- **Tích hợp signals**: Expose Angular signals cho AI agents
- **Model Control Protocol**: Giao thức chuẩn để tích hợp công cụ AI
- **Angular-first**: Hỗ trợ tích hợp sẵn trong Angular 22

## Ví dụ Code

### Thiết Lập WebMCP Cơ Bản

```typescript
import { Component, signal } from '@angular/core';
import { mcpTool } from '@angular/core/webmcp';

@Component({
  selector: 'app-mcp-demo',
  template: `
    <h2>MCP Signal Bridge</h2>
    <p>Nhiệt độ: {{ temperature() }}°C</p>
    <button (click)="increaseTemp()">Tăng</button>
  `
})
export class McpDemoComponent {
  temperature = signal(22);

  @mcpTool({
    name: 'get_temperature',
    description: 'Lấy giá trị nhiệt độ hiện tại'
  })
  getTemperature() {
    return { temperature: this.temperature() };
  }

  @mcpTool({
    name: 'set_temperature',
    description: 'Đặt mức nhiệt độ mục tiêu',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'number', description: 'Nhiệt độ mục tiêu tính bằng Celsius' }
      },
      required: ['value']
    }
  })
  setTemperature(input: { value: number }) {
    this.temperature.set(input.value);
    return { success: true, temperature: this.temperature() };
  }

  increaseTemp() {
    this.temperature.update(t => t + 1);
  }
}
```

### Expose Todo List cho AI

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-todos',
  template: `
    <h2>Todo List (hỗ trợ MCP)</h2>
    <ul>
      @for (todo of todos(); track todo.id) {
        <li>{{ todo.text }} - {{ todo.done ? '✅' : '⬜' }}</li>
      }
    </ul>
    <p>Tổng: {{ todos().length }}, Đã xong: {{ completedCount() }}</p>
  `
})
export class TodosComponent {
  nextId = signal(1);
  todos = signal<{ id: number; text: string; done: boolean }[]>([]);
  completedCount = computed(() => this.todos().filter(t => t.done).length);

  addTodo(text: string) {
    this.todos.update(items => [
      ...items,
      { id: this.nextId(), text, done: false }
    ]);
    this.nextId.update(id => id + 1);
  }

  toggleTodo(id: number) {
    this.todos.update(items =>
      items.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  removeTodo(id: number) {
    this.todos.update(items => items.filter(item => item.id !== id));
  }
}
```

### Cấu Hình WebMCP Provider

```typescript
import { ApplicationConfig, provideWebMCP } from '@angular/core/webmcp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWebMCP({
      name: 'my-angular-app',
      version: '1.0.0'
    })
  ]
};
```

## WebMCP Hoạt Động Như Thế Nào

| Khái niệm | Mô tả |
|---------|-------------|
| **Signal bridge** | AI agents có thể đọc/ghi Angular signals |
| **Tool exposure** | Components expose các phương thức dưới dạng MCP tools |
| **Schema-driven** | Input schemas mô tả tham số của tool |
| **Browser-native** | Không cần middleware phía server |

## Use Cases

1. **Debugging hỗ trợ AI** — Cho phép AI agents kiểm tra state của component
2. **Testing tự động** — Công cụ AI có thể điều khiển các tương tác UI
3. **Phân tích dữ liệu** — Expose computed signals để AI sinh ra insights
4. **Tự động hóa workflow** — Cho phép AI kích hoạt các actions của component

## Tham khảo
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)
