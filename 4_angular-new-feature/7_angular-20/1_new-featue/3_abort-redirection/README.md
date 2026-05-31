# 3. Abort Redirection

## API mới

```ts
Router.getCurrentNavigation()?.abort()
```

## Mục đích

Cho phép huỷ bỏ navigation đang chạy.

## Use cases

### Browser stop button

- User bấm stop khi route đang load.

### Large lazy module

1. User click A
2. Đang load route A
3. User đổi ý và click B
4. Cancel A
