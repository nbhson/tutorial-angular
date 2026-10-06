# 9. HttpResponse / HttpErrorResponse thêm `responseType` (Angular 21)

## Tổng quan

> ⚠️ Đính chính: generic `http.get<T>()` **đã có từ lâu** (không phải feature v21). Feature thật của Angular 21 là `HttpResponse` và `HttpErrorResponse` được bổ sung thuộc tính **`responseType`**, giúp **debug CORS / opaque responses** dễ hơn.

Khi browser chặn response do CORS (opaque response), trước đây developer chỉ thấy status `0` và body `null` mà không biết vì sao. Từ Angular 21, `responseType` cho biết response thuộc loại nào: `basic` | `cors` | `opaque` | `opaqueredirect` | `error` (theo Fetch spec).

## Tại sao cần thay đổi?

```typescript
// Trước Angular 21 — CORS fail chỉ thấy status 0, không rõ nguyên nhân
this._http.get<User[]>('/api/users', { observe: 'response' })
  .subscribe({
    error: (err: HttpErrorResponse) => {
      console.log(err.status);  // 0 — opaque? network down? CORS?
      // Không phân biệt được
    }
  });
```

```typescript
// Sau Angular 21 — có responseType để phân biệt
this._http.get<User[]>('/api/users', { observe: 'response' })
  .subscribe({
    error: (err: HttpErrorResponse) => {
      console.log(err.status);       // 0
      console.log(err.responseType); // 'opaque' | 'cors' | 'basic' | 'error' — biết ngay do CORS
    }
  });
```

## Ví dụ chi tiết

### Component — Debug CORS bằng responseType

```typescript
@Component({
  selector: 'app-users',
  template: `
    <h2>Users</h2>
    @if (loading()) {
      <p>Đang tải...</p>
    } @else {
      <ul>
        @for (user of users(); track user.id) {
          <li>{{ user.name }} - {{ user.email }}</li>
        }
      </ul>
    }
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
  `
})
export class UsersComponent {
  private readonly _http = inject(HttpClient);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.loading.set(true);

    this._http.get<User[]>('/api/users', { observe: 'response' }).subscribe({
      next: (res: HttpResponse<User[]>) => {
        this.users.set(res.body ?? []);
        console.log(res.responseType); // 'basic' | 'cors' — response hợp lệ
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.responseType === 'opaque' || err.responseType === 'opaqueredirect') {
          this.error.set('Bị chặn bởi CORS (opaque response) — kiểm tra Access-Control-Allow-Origin ở server.');
        } else {
          this.error.set(err.message);
        }
        this.loading.set(false);
      }
    });
  }
}
```

### Các giá trị responseType (theo Fetch spec)

| Giá trị | Ý nghĩa |
|---------|---------|
| `basic` | Cùng origin — response đầy đủ |
| `cors` | Cross-origin hợp lệ (server có ACAO header) |
| `opaque` | Bị chặn — browser giấu body/status vì thiếu CORS header |
| `opaqueredirect` | Redirect tới opaque response |
| `error` | Lỗi mạng (network error) |

## Best Practices

1. **Dùng `observe: 'response'`** khi cần debug CORS — mới đọc được `responseType`
2. **Phân biệt `opaque` vs network error** trước khi báo lỗi cho user
3. **`get<T>` generic vẫn dùng như cũ** — không có gì thay đổi ở v21

## Tham khảo

- [Angular 21 — What's New — angular.love](https://angular.love/angular-21-whats-new)
- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular HttpClient Guide](https://angular.dev/guide/http/making-requests)
