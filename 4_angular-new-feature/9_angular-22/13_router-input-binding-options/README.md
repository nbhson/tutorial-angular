# Router: Navigation API + withComponentInputBinding Options (v22)

## Tổng quan
`withComponentInputBinding()` nhận thêm `options`: `{ queryParams, unmatchedInputBehavior }`.

## Điểm chính
- `queryParams: false`: tắt bind queryParams khi tự quản lý query riêng.
- `unmatchedInputBehavior: 'undefinedIfStale'`: tránh set `undefined` cho inputs chưa từng có trong router data.

## Ví dụ Code
```typescript
provideRouter(routes,
  withComponentInputBinding({ queryParams: false }),
);
provideRouter(routes,
  withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }),
);
```

## Tham khảo
- [Angular v22 changelog](https://github.com/angular/angular/releases/tag/v22.0.0)
- `4_angular-new-feature/9_angular-22/6_router-params-inheritance/`
