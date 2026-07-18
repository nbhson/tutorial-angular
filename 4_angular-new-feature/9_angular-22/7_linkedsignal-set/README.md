# linkedSignal Gets a Direct `.set()`

## Overview
Angular 22 adds a direct `.set()` method to `linkedSignal` — no more calling `.set()` through `.asReadonly()` or writing awkward workarounds. You can now both read and write a linked signal from wherever you need it.

## Key Features

- **Direct `.set()` method**: No more workaround needed
- **Writable by default**: `linkedSignal` is now both readable and writable
- **Backward compatible**: Existing `linkedSignal` usage keeps working
- **Cleaner code**: Removes boilerplate for write patterns

## Code Examples

### Basic linkedSignal with `.set()`

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <h2>Counter: {{ counter() }}</h2>
    <button (click)="reset()">Reset</button>
    <button (click)="setToTen()">Set to 10</button>
  `
})
export class CounterComponent {
  source = signal(0);
  
  // linkedSignal with direct .set()
  counter = linkedSignal(() => this.source());
  
  reset() {
    this.source.set(0); // Changes source, counter updates
  }
  
  setToTen() {
    this.counter.set(10); // Direct set! New in Angular 22
  }
}
```

### Before Angular 22 (Workaround Required)

```typescript
// Angular 21 - had to use awkward patterns
@Component({
  selector: 'app-old-counter',
  template: `
    <h2>Counter: {{ counter() }}</h2>
    <button (click)="reset()">Reset</button>
  `
})
export class OldCounterComponent {
  source = signal(0);
  
  // No direct .set() available
  counter = linkedSignal(() => this.source());
  
  reset() {
    this.source.set(0); // Had to modify source instead
  }
}
```

### Bidirectional Binding with linkedSignal

```typescript
import { Component, signal, linkedSignal } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `
    <input [value]="searchTerm()" (input)="onInput($event)" />
    <p>Searching for: {{ searchTerm() }}</p>
    @if (debouncedTerm() !== searchTerm()) {
      <p>Debounced: {{ debouncedTerm() }} (updating...)</p>
    }
  `
})
export class SearchComponent {
  searchTerm = signal('');
  
  // Computed from source, but also directly settable
  debouncedTerm = linkedSignal(() => this.searchTerm());
  
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    
    // Debounce: reset after delay
    setTimeout(() => {
      this.debouncedTerm.set(value);
    }, 300);
  }
}
```

### linkedSignal with Options

```typescript
import { linkedSignal } from '@angular/core';

// With equality check
const selection = linkedSignal({
  source: () => this.currentItem(),
  computation: (item) => ({
    ...item,
    selected: true
  }),
  equal: (a, b) => a.id === b.id
});

// With reset behavior
const formField = linkedSignal({
  source: () => this.formData(),
  computation: (data) => ({
    value: data.defaultValue,
    touched: false
  })
});
```

## API Reference

| Method | Description | New in v22 |
|--------|-------------|------------|
| `linkedSignal(() => expr)` | Create a writable linked signal | ✅ `.set()` added |
| `.set(value)` | Set the value directly | ✅ **New** |
| `.update(fn)` | Update via function | ✅ **New** |
| `.asReadonly()` | Get a read-only version | Existing |

## Migration

No changes needed for existing apps. The new `.set()` is purely additive:

```typescript
// Both patterns work in Angular 22
const counter = linkedSignal(() => this.source());
counter.set(10);      // New: direct write
this.source.set(10);  // Existing: still works
```

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)