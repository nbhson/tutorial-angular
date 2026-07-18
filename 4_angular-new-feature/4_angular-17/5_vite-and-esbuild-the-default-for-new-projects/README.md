# Vite & esBuild — Default Build System cho New Projects

## Tổng quan

Angular 17 đưa **Vite + esBuild** trở thành build system mặc định cho tất cả projects mới, thay thế webpack. Đây là bước ngoặt lớn giúp cải thiện đáng kể hiệu suất build và development experience.

Trước Angular 17, Vite + esBuild chỉ ở developer preview (từ Angular 16). Với Angular 17, nó chính thức trở thành default builder.

## Cấu trúc files

```
5_vite-and-esbuild-the-default-for-new-projects/
├── README.md     # Documentation và screenshots
├── image.png     # Screenshot so sánh performance
└── image-1.png   # Screenshot build output
```

> Folder này là documentation-only, không chứa source code. Demo được thể hiện qua screenshots và config comparison.

## Cải thiện Performance

### Build Time (`ng build`)

- **SSR & SSG**: Lên đến **87% nhanh hơn** so với旧 webpack builder
- **Enterprise partners**: Báo cáo **67% build time improvement** trong production apps

### Dev Server (`ng serve`)

- **Edit-refresh loop**: **80% nhanh hơn** so với旧 builder
- **HMR (Hot Module Replacement)**: Gần như instant

## So sánh Builder

| Feature |旧 Builder (webpack) | New Builder (Vite + esBuild) |
|---------|---------------------|------------------------------|
| Build time | Baseline | ~67-87% faster |
| Dev server | HMR chậm hơn | HMR gần như instant |
| SSR | Phức tạp | Built-in support |
| Bundle | Không tối ưu | Tree-shaking tốt hơn |
| ESM | CommonJS | Native ESM |

## Cách kiểm tra Builder

```bash
# Tạo project mới — mặc định dùng Vite + esBuild
ng new my-app

# Kiểm tra builder trong angular.json
cat angular.json | grep builder
# "builder": "@angular-devkit/build-angular:application"

#旧 builder (webpack) sẽ hiển thị:
# "builder": "@angular-devkit/build-angular:browser"
```

## Angular.json Configuration

### New Builder (Vite + esBuild) — Mặc định

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/my-app",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "server": "src/main.server.ts",
            "ssr": {
              "entry": "server.ts"
            }
          }
        }
      }
    }
  }
}
```

###旧 Builder (webpack) — Deprecated

```json
{
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser",
      "options": {
        "main": "src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "tsconfig.app.json"
      }
    }
  }
}
```

## Migration

Angular sẽ cung cấp schematics tự động migrate projects hiện tại sang builder mới trong tương lai. Tuy nhiên, hiện tại bạn có thể migrate thủ công:

```bash
# 1. Cập nhật angular.json
# Đổi builder từ "browser" sang "application"

# 2. Cập nhật polyfills
# Xóa "polyfills": ["zone.js"] và chuyển sang file polyfills.ts riêng

# 3. Kiểm tra compatibility
# Một số libraries có thể cần update để tương thích với esBuild
```

## Lưu ý khi Migration

1. **esBuild không hỗ trợ some metadata decorators** — Kiểm tra第三方 libraries
2. **CommonJS modules** — esBuild ưu tiên ESM, một số packages cần update
3. **Sass/SCSS** — Hỗ trợ đầy đủ nhưng có thể có subtle differences
4. **Source maps** — Format source maps có thể khác webpack

## Lợi ích tổng thể

1. **Speed** — Build nhanh hơn 67-87%, HMR instant
2. **SSR** — Built-in SSR support, không cần config phức tạp
3. **Tree-shaking** — Better bundle optimization
4. **DX** — Dev experience mượt mà hơn
5. **Modern** — Native ESM, hiện đại hơn CommonJS

## Cách sử dụng

```bash
# Tạo project mới với Vite + esBuild (mặc định)
ng new my-app

# Chạy development server
cd my-app
ng serve

# Build production
ng build
```

## Tài liệu tham khảo

- [Introducing Angular v17](https://blog.angular.dev/introducing-angular-v17-4d7033312e4b)
- [Angular CLI Builders](https://angular.dev/tools/cli/builders)
- [Vite + esBuild in Angular](https://angular.dev/reference/configurations/angular-json#builders)