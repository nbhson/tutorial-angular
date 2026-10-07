# Angular Libraries (Tạo & Publish Lib)

> Nguồn: https://angular.dev/tools/libraries

## Tổng quan
Repo chưa có guide tạo lib riêng. Chuẩn: `ng generate library <tên>` → build bằng `ng-packagr` → publish npm.

## Điểm chính
- Mỗi lib có `public-api.ts` (barrel exports); secondary entry points cho module lớn.
- Build: `ng build my-lib`; test consumer qua `npm link` trước khi publish.

## Ví dụ Code
```bash
ng generate library my-lib
ng build my-lib
npm publish dist/my-lib
```

```typescript
// projects/my-lib/src/public-api.ts
export * from './lib/my-button';
export * from './lib/my-service';
```

## Tham khảo
- [Libraries](https://angular.dev/tools/libraries)
