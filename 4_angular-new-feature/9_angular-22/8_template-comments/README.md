# Comments in Templates

## Overview
Angular 22 adds support for comments in templates. This sounds small, but it fills a gap that has been there since the beginning.

## Key Features

- **HTML-style comments**: Use `<!-- comment -->` in templates
- **Works with control flow**: Comments inside `@if`, `@for`, `@switch` blocks
- **Conditional display**: Show/hide comments based on conditions
- **No runtime cost**: Comments are stripped from production builds
- **IDE support**: Syntax highlighting and formatting

## Code Examples

### Basic Template Comments

```typescript
@Component({
  selector: 'app-demo',
  template: `
    <h1>My Component</h1>
    <!-- This is a comment - visible in dev, stripped in prod -->
    <p>Some content</p>
    <!-- TODO: Add form validation later -->
    <form>
      <input type="text" />
    </form>
  `
})
export class DemoComponent {}
```

### Comments in Control Flow

```typescript
@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      @for (user of users(); track user.id) {
        <!-- User item with avatar -->
        <li>
          <img [src]="user.avatar" [alt]="user.name" />
          <span>{{ user.name }}</span>
        </li>
        
        <!-- Separator between items -->
        @if (!$last) {
          <li class="separator"></li>
        }
      } @empty {
        <!-- No users found state -->
        <li class="empty">No users found</li>
      }
    </ul>
  `
})
export class UserListComponent {
  users = signal<User[]>([]);
}
```

### Conditional Comments with @if

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <!-- DEBUG: Uncomment to show debug info -->
      <!-- @if (debugMode()) {
        <pre>{{ state() | json }}</pre>
      } -->
      
      <h1>Dashboard</h1>
      
      <!-- 
        TODO: Implement the following features:
        - Real-time notifications
        - Data export
        - User preferences
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

### Nested Comments

```typescript
@Component({
  selector: 'app-complex',
  template: `
    <div>
      <!-- 
        Layout structure:
        Header -> Main Content -> Footer
        
        Author: John Doe
        Last updated: 2025-01-15
      -->
      
      <!-- Header Section -->
      <header>
        <nav>
          <!-- Navigation items are defined in NavComponent -->
        </nav>
      </header>
      
      <!-- Main Content -->
      <main>
        <!-- Content renders based on current route -->
        <router-outlet />
      </main>
      
      <!-- Footer Section -->
      <footer>
        <app-footer />
      </footer>
    </div>
  `
})
export class ComplexComponent {}
```

## Before vs After

```typescript
// Before Angular 22 - No comments allowed
@Component({
  template: `
    <div>
      <!-- This would cause a compilation error -->
      <p>Content</p>
    </div>
  `
})

// Angular 22 - Comments work perfectly
@Component({
  template: `
    <div>
      <!-- This is now valid -->
      <p>Content</p>
    </div>
  `
})
```

## Benefits

| Use Case | Description |
|----------|-------------|
| **Documentation** | Explain complex template logic |
| **Debugging** | Comment out sections during development |
| **Collaboration** | Leave notes for team members |
| **Code organization** | Mark sections with descriptive headers |
| **TODO tracking** | Inline reminders for future work |

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)