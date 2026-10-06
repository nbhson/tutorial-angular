# 10. TypeScript Isolated Modules Support

> Ghi chú version: feature này có từ **v18.2, không phải new v19** — tài liệu này nằm trong series v19 vì v19 kế thừa và khuyến nghị bật mặc định cho project mới.

## Mô tả

Angular hỗ trợ `isolatedModules` trong TypeScript compiler options. Khi bật, TypeScript code sẽ được transpile qua **esbuild bundler** thay vì TypeScript compiler trực tiếp — dẫn đến **performance boost lên đến 10%** trong production build times.

## Vấn đề giải quyết

Trước đây:
- TypeScript transpile qua TS compiler → chậm hơn
- Không tận dụng được esbuild optimizations
- Bundle size lớn hơn do thiếu optimization passes

```json
// ❌ Trước — dùng TypeScript compiler trực tiếp
{
  "compilerOptions": {
    "isolatedModules": false  // hoặc không set
  }
}
```

```json
// ✅ Angular 18.2+ — transpile qua esbuild
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

## Cách hoạt động

```
Trước (isolatedModules: false):
TypeScript Source → TypeScript Compiler → JS Output

Sau (isolatedModules: true):
TypeScript Source → esbuild Bundler → JS Output (optimized)
```

**esbuild optimizations:**
- Inline `const` enums where possible
- Inline regular enums where possible
- Remove Babel-based optimization passes for TypeScript
- Better tree-shaking
- Faster transpilation

## Files trong project

### tsconfig.json — Configuration

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "useDefineForClassFields": true  // Recommended for optimal output
  }
}
```

### `src/app/app.component.ts` — Component example

```ts
// ✅ isolatedModules compatible — named export
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// ✅ isolatedModules compatible — default export with named class
export default class AppComponent {
  // ...
}
```

## Bật isolatedModules

### Bước 1: Update tsconfig.json

```json
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

### Bước 2: Đảm bảo useDefineForClassFields

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "useDefineForClassFields": true
  }
}
```

> `useDefineForClassFields: true` giúp đảm bảo output code size tối ưu.

### Bước 3: Kiểm tra TypeScript errors

```bash
# Run type checking — isolatedModules chỉ transpile, không type-check
# nên phải chạy riêng:
tsc --noEmit
```

## Performance Improvements

| Metric | isolatedModules: false | isolatedModules: true |
|--------|----------------------|----------------------|
| Production build time | Baseline | **-10% faster** |
| Enum handling | TypeScript compiler | esbuild inline |
| Babel passes | TypeScript → Babel | JavaScript only |
| Source maps | TS-based | Bundler-based |

## isolatedModules Rules

Khi bật `isolatedModules`, TypeScript enforce thêm rules:

```ts
// ❌ VIOLATION — re-export type only
export { Todo } from './types'; // TypeScript ko thể check được

// ✅ SOLUTION — dùng `export type`
export type { Todo } from './types';

// ❌ VIOLATION — const enum
const enum Status { Active, Inactive }
export const status = Status.Active;

// ✅ SOLUTION — dùng regular enum
export enum Status { Active, Inactive }
export const status = Status.Active;
```

## Khi nào dùng isolatedModules?

- **Mọi project mới**Angular 18.2+ — nên bật ngay
- **Existing projects** — enable khi upgrade Angular
- **Performance critical** projects — cần build time optimization
- **CI/CD pipelines** — giảm build time

## Lưu ý quan trọng

- **Type checking**: `isolatedModules` KHÔNG thay thế type checking. Vẫn cần chạy `tsc --noEmit` riêng (không có lệnh `ng build --type-check`)
- **Source maps**: Khi bật script sourcemaps + isolatedModules, sourcemap behavior có thể khác
- **Third-party libraries**: Các library code vẫn được xử lý qua Babel, không thay đổi

## Reference

- [TypeScript isolatedModules](https://www.typescriptlang.org/tsconfig#isolatedModules)
- [Angular Build Optimization](https://angular.dev/tools/cli/build)
- [Angular 18.2 Release Notes](https://blog.angular.dev/angular-v18-2-is-now-available-7c66a836b01e)
- [esbuild in Angular](https://angular.dev/tools/cli/builders/application-builder)