# Micro Frontend — Tổng quan

Tách ứng dụng frontend lớn thành các phần độc lập, mỗi phần do một team phát triển và deploy riêng.

| # | Folder | Chủ đề |
|---|---|---|
| 19 | [19-micro-frontend-client/](19-micro-frontend-client/README.md) | Tổng quan micro frontend + các phương pháp áp dụng |
| 20 | [20-module-federation/](20-module-federation/README.md) | Module Federation (webpack/rspack) — mental model nền tảng |
| 21 | [21-native-federation/](21-native-federation/README.md) | **Native Federation v4 — cách tiếp cận hiện tại cho Angular 22** (esbuild, import maps) |

## Lộ trình công nghệ

```
Webpack Module Federation (2020)  →  Native Federation v3 (esbuild, 2023)
                                  →  Native Federation v4 + Orchestrator (Angular 22, hiện tại)
```

- Angular đã bỏ webpack từ v17 (esbuild-based `@angular/build:application`), nên cách tiếp cận chuẩn hiện nay là **Native Federation** — cùng mental model (host/remote/share) nhưng chạy trên chuẩn web: ES Modules + Import Maps.
- Module Federation vẫn hữu ích khi mix các app không dùng esbuild (webpack/rspack, Next.js...).

## Khi nào dùng micro frontend?

✅ Nhiều team lớn, deploy độc lập · ✅ Tích hợp dần app cũ · ❌ Team nhỏ, app vừa — tốn chi phí vận hành hơn lợi ích.

## Tham khảo

- [Native Federation](https://native-federation.com)
- [angular-architects.io — blog Manfred Steyer](https://www.angulararchitects.io)
- [Micro Frontends — blog.angular.dev](https://blog.angular.dev/micro-frontends-with-angular-and-native-federation-7623cfc5f413)
