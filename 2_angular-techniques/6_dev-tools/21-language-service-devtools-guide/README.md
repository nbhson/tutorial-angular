# Language Service + Angular DevTools Guide

> Nguồn: https://angular.dev/tools/language-service, /tools/devtools

## Tổng quan
Hai tool DX bắt buộc: **Language Service** (completion/diagnostics trong IDE) + **DevTools** (component tree, DI tree, signals inspect, flame chart).

## Điểm chính
- Language Service: cài extension `Angular Language Service` (VSCode), bật `strictTemplates` để có type-check + extended diagnostics (`nullishCoalescingNotNullable`, `NG8023`...).
- DevTools (Chrome extension): inspect signal graph (v20+), profiler tìm component check thừa, debug hydration mismatch.
- V22 mới: diagnostics `optionalChainNotNullable`, safe-navigation narrowing.

## Ví dụ Code
```json
// tsconfig.json
{ "angularCompilerOptions": {
  "strictTemplates": true,
  "extendedDiagnostics": { "checks": { "optionalChainNotNullable": "error" } }
}}
```

```bash
# DevTools: cài từ Chrome Web Store "Angular DevTools" → mở tab Profiler → Record
```

## Tham khảo
- [Language Service](https://angular.dev/tools/language-service)
- [DevTools](https://angular.dev/tools/devtools)
- `4_angular-new-feature/9_angular-22/11_language-service-devtools/`
