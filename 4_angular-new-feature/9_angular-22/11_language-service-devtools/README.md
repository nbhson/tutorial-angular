# Language Service and DevTools

## Overview
Angular 22 brings significant improvements to the Angular Language Service and DevTools, providing better developer experience with enhanced debugging, performance profiling, and code intelligence.

## Key Features

- **Language Service improvements**: Better autocomplete, diagnostics, and refactoring
- **DevTools updates**: Enhanced debugging capabilities
- **Signal visualization**: See signal dependencies in real-time
- **Performance profiling**: Track component render times
- **Template debugging**: Improved template error messages

## Code Examples

### Language Service Features

```typescript
// Angular Language Service provides intelligent suggestions
@Component({
  selector: 'app-demo',
  template: `
    <!-- Autocomplete for signals -->
    {{ count() }}
    
    <!-- Autocomplete for component properties -->
    {{ userName() }}
    
    <!-- Type-safe pipe arguments -->
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
// DevTools now shows signal graph visualization
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
  // DevTools shows these as a dependency graph
  count = signal(0);           // Source signal
  doubled = computed(() => this.count() * 2);  // Depends on count
  status = computed(() =>      // Depends on count
    this.count() > 10 ? 'High' : 'Normal'
  );
  
  increment() {
    this.count.update(c => c + 1);
    // DevTools shows: count updated → doubled re-computed → status re-computed
  }
}
```

### Performance Profiling with DevTools

```typescript
// DevTools Component Profiler tracks render performance
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
  
  // DevTools shows when this recomputes
  visibleRows = computed(() => 
    this.allRows().filter(r => r.visible)
  );
  
  // DevTools profiler shows:
  // - Component initialization time
  // - Change detection cycles
  // - Signal update frequency
  // - Render time per update
}
```

### Language Service Diagnostics

```typescript
// Angular Language Service catches common errors

@Component({
  selector: 'app-diagnostics',
  template: `
    <!-- ✅ Language Service knows this is valid -->
    @if (isVisible()) {
      <p>Visible content</p>
    }
    
    <!-- ✅ Proper signal call detection -->
    <span>{{ counter() }}</span>
    
    <!-- ✅ Catches missing signal calls -->
    <!-- <span>{{ counter }}</span> → Warning: Did you mean counter()? -->
    
    <!-- ✅ Template type checking -->
    <!-- {{ undefined.property }} → Error: Property 'property' does not exist -->
  `
})
export class DiagnosticsComponent {
  isVisible = signal(true);
  counter = signal(0);
}
```

### Refactoring Support

```typescript
// Language Service supports safe refactoring

// Rename signal → automatically updates all template references
// Before:
count = signal(0);        // Template: {{ count() }}

// After renaming to "itemCount":
itemCount = signal(0);    // Template: {{ itemCount() }}  ← Auto-updated!

// Extract method refactoring in templates
// Split complex expressions into readable methods
@Component({
  template: `
    <!-- Before: Complex inline expression -->
    <!-- {{ items().filter(i => i.active).map(i => i.name).join(', ') }} -->
    
    <!-- After refactoring: Clean method call -->
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

## DevTools Features

| Feature | Description |
|---------|-------------|
| **Signal Inspector** | View signal values and dependency graph |
| **Component Profiler** | Track render times and change detection cycles |
| **State Explorer** | Inspect component state in real-time |
| **Router Inspector** | Visualize route tree and navigation |
| **Dependency Graph** | See component hierarchy and injection tree |
| **Template Debugger** | Step through template rendering |

## Language Service Features

| Feature | Description |
|---------|-------------|
| **Autocomplete** | Smart suggestions for signals, pipes, directives |
| **Diagnostics** | Real-time error detection in templates |
| **Hover Info** | Type information on hover |
| **Go to Definition** | Navigate to component/directive definitions |
| **Find References** | Locate all usages of components/pipes |
| **Quick Fixes** | Automated suggestions for common issues |

## Setup

```bash
# Install Angular Language Service in VS Code
code install Angular.ng-template

# Enable strict mode in tsconfig.json
{
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true
  }
}
```

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)