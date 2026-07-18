# OnPush Is the New Default

## Overview
In Angular 22, components use `ChangeDetectionStrategy.OnPush` by default instead of the old "check always" behavior. This is the natural result of the zoneless, signal-first direction.

## Key Points

- **New default**: Components without `changeDetection` property use `OnPush` automatically
- **`ChangeDetectionStrategy.Eager`**: New name for the old "check always" default
- **Automatic migration**: Angular adds `Eager` to existing components where needed
- **Works with zoneless**: OnPush controls which views get checked; zoneless removes zone.js as trigger

## Code Examples

### New component (Angular 22 default - OnPush)

```typescript
// No changeDetection needed - OnPush is the default
@Component({
  selector: 'app-counter',
  template: `{{ count() }}`
})
export class Counter {
  count = signal(0); // OnPush + signals: updates just work
}
```

### Legacy component (migration adds Eager)

```typescript
// The migration adds Eager to keep the old behavior
@Component({
  selector: 'app-legacy',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `…`
})
export class Legacy {}
```

### Zoneless app config

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection()
  ]
};
```

## Why It Matters

1. **Performance**: New components get high-performance change detection for free
2. **Migration path**: `Eager` markers act as a to-do list for step-by-step cleanup
3. **Signal-first**: When using signals, you usually don't need to think about change detection
4. **Backward compatible**: Existing apps keep working via automatic migration

## Migration Strategy

```bash
# Run the automatic migration
ng generate @angular/core:change-detection-migration
```

After migration, search codebase for `Eager` to find components that need cleanup:

```typescript
// Each Eager result is a candidate for OnPush conversion
@Component({
  changeDetection: ChangeDetectionStrategy.Eager // ← Remove and use signals
})
```

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)