# WebMCP — MCP Runs in the Browser

## Overview
Angular 22 ships a WebMCP client. You can expose signals, models, or actions to an AI agent right inside the browser — no server glue required.

## Key Features

- **Browser-based MCP**: MCP runs directly in the browser, no server needed
- **Signal integration**: Expose Angular signals to AI agents
- **Model Control Protocol**: Standard protocol for AI tool integration
- **Angular-first**: Built-in support in Angular 22

## Code Examples

### Basic WebMCP Setup

```typescript
import { Component, signal } from '@angular/core';
import { mcpTool } from '@angular/core/webmcp';

@Component({
  selector: 'app-mcp-demo',
  template: `
    <h2>MCP Signal Bridge</h2>
    <p>Temperature: {{ temperature() }}°C</p>
    <button (click)="increaseTemp()">Increase</button>
  `
})
export class McpDemoComponent {
  temperature = signal(22);

  @mcpTool({
    name: 'get_temperature',
    description: 'Get the current temperature reading'
  })
  getTemperature() {
    return { temperature: this.temperature() };
  }

  @mcpTool({
    name: 'set_temperature',
    description: 'Set the temperature target',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'number', description: 'Target temperature in Celsius' }
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

### Exposing a Todo List to AI

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-todos',
  template: `
    <h2>Todo List (MCP-enabled)</h2>
    <ul>
      @for (todo of todos(); track todo.id) {
        <li>{{ todo.text }} - {{ todo.done ? '✅' : '⬜' }}</li>
      }
    </ul>
    <p>Total: {{ todos().length }}, Done: {{ completedCount() }}</p>
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

### Configuring WebMCP Provider

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

## How WebMCP Works

| Concept | Description |
|---------|-------------|
| **Signal bridge** | AI agents can read/write Angular signals |
| **Tool exposure** | Components expose methods as MCP tools |
| **Schema-driven** | Input schemas describe tool parameters |
| **Browser-native** | No server middleware needed |

## Use Cases

1. **AI-powered debugging** — Let AI agents inspect component state
2. **Automated testing** — AI tools can drive UI interactions
3. **Data analysis** — Expose computed signals for AI insight generation
4. **Workflow automation** — Let AI trigger component actions

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)