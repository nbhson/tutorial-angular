# Angular 22

## Release Date
June 2025 (RC), ~August 2025 (Stable)

## Overview

Angular 22 moves several experimental features from v21 into stable territory and tightens the framework around signals, zoneless change detection, and type-safe forms. The release is lean on brand-new APIs, focusing instead on promoting what developers already adopted behind `provideExperimental*` flags.

## Key Features

### 1. OnPush Is the New Default
New components default to `ChangeDetectionStrategy.OnPush`. Angular introduces `ChangeDetectionStrategy.Eager` for the old "check always" behavior. An automatic migration marks existing components that need attention.

📄 [Details →](1_onpush-default/README.md)

### 2. Signal Forms Go Stable
Signal Forms shipped as experimental in v21 and become stable. The `form()`, `FormField`, and built-in validators no longer require experimental providers. Typed validation errors, public `date`/`limit` validators, and improved performance round out the feature.

📄 [Details →](2_signal-forms-stable/README.md)

### 3. resource() and httpResource() Go Stable
Both `resource()` and `httpResource()` move to stable. The `rxResource` subscription leak is fixed, and resource URL sanitization becomes case-insensitive. These primitives keep async data inside the signal graph.

📄 [Details →](3_resource-httpresource-stable/README.md)

### 4. WebMCP — MCP Runs in the Browser
Angular 22 ships a WebMCP client. You can expose signals, models, or actions to an AI agent directly in the browser without server glue.

📄 [Details →](4_webmcp/README.md)

### 5. Service Creation: `inject` and `injectAsync`
Top-level `inject()` and `injectAsync()` simplify service creation without constructors, making services leaner and tree-shaking easier.

📄 [Details →](5_service-injectAsync/README.md)

### 6. Router: Params Inheritance by Default
Child routes automatically inherit parent route params without extra configuration. No more `paramsInheritanceStrategy: 'always'`.

📄 [Details →](6_router-params-inheritance/README.md)

### 7. linkedSignal Gets a Direct `.set()`
`linkedSignal` gains a direct `.set()` and `.update()` method — no more workarounds through `.asReadonly()`.

📄 [Details →](7_linkedsignal-set/README.md)

### 8. Comments in Templates
Angular 22 adds support for HTML-style comments (`<!-- -->`) in templates, working with all control flow blocks.

📄 [Details →](8_template-comments/README.md)

### 9. Security Hardening
Stricter sanitization by default. Using `DomSanitizer.bypassSecurityTrust*` now triggers dev warnings and stricter production handling.

📄 [Details →](9_security-hardening/README.md)

### 10. Compiler and Type-Safety Improvements
Stricter type checking, better signal type inference, enhanced template diagnostics, and improved TypeScript integration.

📄 [Details →](10_compiler-typesafety/README.md)

### 11. Language Service and DevTools
Enhanced debugging with signal graph visualization, performance profiling, better autocomplete, diagnostics, and refactoring support.

📄 [Details →](11_language-service-devtools/README.md)

## Summary Table

| Feature | Status | Key Change |
|---------|--------|------------|
| OnPush Default | ✅ Stable | New default for components |
| Signal Forms | ✅ Stable | No longer experimental |
| resource/httpResource | ✅ Stable | Subscription leak fixed |
| WebMCP | ✅ New | Browser-based MCP client |
| inject/injectAsync | ✅ New | Constructor-free services |
| Params Inheritance | ✅ Default | Automatic in router |
| linkedSignal .set() | ✅ New | Direct write support |
| Template Comments | ✅ New | `<!-- -->` support |
| Security Hardening | ✅ Stricter | Dev warnings for bypass |
| Type Safety | ✅ Improved | Stricter defaults |
| Language Service | ✅ Improved | Signal visualization |

## Key Takeaways

1. **Stability over novelty** — Angular 22 promotes experimental features to stable
2. **Signal-first architecture** — All new APIs are signal-based
3. **Type safety everywhere** — Stricter defaults catch errors at compile time
4. **Developer experience** — Template comments, better DevTools, simpler service patterns
5. **Security by default** — Stricter sanitization encourages secure coding

## References
- [Angular 22: Key Features and Changes](https://angular.love/angular-22-key-features-and-changes)