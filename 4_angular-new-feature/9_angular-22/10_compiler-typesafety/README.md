# Compiler and Type-Safety Improvements

## Overview
Angular 22 strengthens type safety across the framework and cleans up internal compiler paths.

## Key Features

- **Stricter type checking**: Better TypeScript integration
- **Compiler optimizations**: Faster compilation with cleaner internal paths
- **Signal type inference**: Improved type inference for signals
- **Template type checking**: Enhanced template diagnostics

## Code Examples

### Strict Template Type Checking

```typescript
// Angular 22: Stricter template type checking enabled by default
@Component({
  selector: 'app-strict-demo',
  template: `
    <!-- ✅ Type-safe: Angular knows this is a number -->
    <span>{{ count() }}</span>
    
    <!-- ❌ Type error: Angular catches this at compile time -->
    <!-- <span>{{ count() + "not a number" }}</span> -->
    
    <!-- ✅ Type-safe: Proper null check -->
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

### Signal Type Inference

```typescript
// Angular 22: Better type inference for complex signal types
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
    <!-- Full type safety with nested properties -->
    <div [class]="user().preferences.theme">
      <h2>{{ user().name }}</h2>
      <p>{{ user().email }}</p>
      <span>Theme: {{ user().preferences.theme }}</span>
    </div>
  `
})
export class UserProfileComponent {
  // Angular 22: Full type inference for complex signals
  user = signal<User>({
    id: 1,
    name: 'John',
    email: 'john@example.com',
    preferences: { theme: 'dark', language: 'en' }
  });
}
```

### Strict Event Binding

```typescript
@Component({
  selector: 'app-form',
  template: `
    <!-- Angular 22: Proper event type inference -->
    <input (input)="onInput($event)" />
    <button (click)="onClick($event)">Submit</button>
    <form (submit)="onSubmit($event)">
      <input type="text" />
    </form>
  `
})
export class FormComponent {
  // $event is properly typed as InputEvent
  onInput(event: InputEvent) {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
  }

  // $event is properly typed as MouseEvent
  onClick(event: MouseEvent) {
    console.log(event.clientX, event.clientY);
  }

  // $event is properly typed as SubmitEvent
  onSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log('Form submitted');
  }
}
```

### Typed Dependency Injection

```typescript
// Angular 22: Better type safety for injection tokens
import { InjectionToken, inject } from '@angular/core';

interface AppConfig {
  apiUrl: string;
  timeout: number;
  debug: boolean;
}

const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// Type-safe usage
@Component({
  selector: 'app-config-demo',
  template: `
    <p>API URL: {{ config.apiUrl }}</p>
    <p>Timeout: {{ config.timeout }}ms</p>
  `
})
export class ConfigDemoComponent {
  private config = inject(APP_CONFIG);
  // config is fully typed as AppConfig
  
  constructor() {
    // TypeScript enforces the interface
    console.log(this.config.apiUrl);    // ✅ string
    console.log(this.config.timeout);   // ✅ number
    console.log(this.config.debug);     // ✅ boolean
  }
}
```

### Generic Component Type Safety

```typescript
// Angular 22: Enhanced generic type support
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

## Type Safety Improvements

| Feature | Before | After |
|---------|--------|-------|
| **Signal types** | Basic inference | Full generic support |
| **Template checking** | Optional warnings | Strict by default |
| **Event types** | Often `any` | Proper `$event` typing |
| **DI tokens** | Loose typing | Enforced interfaces |
| **Generic components** | Limited support | Enhanced type inference |

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)