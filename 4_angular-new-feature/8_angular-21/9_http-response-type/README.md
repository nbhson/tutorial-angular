# 9. HTTP Response Type Safety (Angular 21)

## Tổng quan

Angular 21 cải thiện **type safety** cho HTTP responses. Previously, tất cả HTTP responses đều trả về `Observable<HttpEvent<any>>` — không phân biệt success hay error. Từ Angular 21, developer có thể specify **response type chính xác** mà không cần cast.

## Tại sao cần thay đổi?

### Trước Angular 21

```typescript
// HttpEvent<any> — không có type safety
this._http.get<User[]>('/api/users', { observe: 'response' })
  .subscribe((response: HttpResponse<User[]>) => {
    // response.body — type: User[] (nhưng cần cast)
    // response.status — type: number
    // Phải check status thủ công
  });
```

### Sau Angular 21

```typescript
// Type-safe response
this._http.get<User[]>('/api/users')
  .subscribe((users) => {
    // users — type: User[] (trực tiếp, không cần cast)
  });
```

## Ví dụ chi tiết

### Component

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

    this._http.get<User[]>('/api/users').subscribe({
      next: (users) => {
        this.users.set(users);     // type: User[]
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
```

### POST với Type Safety

```typescript
// POST request — type-safe
createUser(user: CreateUserDto): Observable<User> {
  return this._http.post<User>('/api/users', user);
  // Response type: User — không cần cast
}

// PUT request — type-safe
updateUser(id: string, data: Partial<User>): Observable<User> {
  return this._http.put<User>(`/api/users/${id}`, data);
  // Response type: User
}

// DELETE request — type-safe
deleteUser(id: string): Observable<void> {
  return this._http.delete<void>(`/api/users/${id}`);
  // Response type: void
}
```

### HttpResponse vs HttpEvent

```typescript
// observe: 'response' — trả về HttpResponse<T>
this._http.get<User[]>('/api/users', { observe: 'response' })
  .subscribe((response: HttpResponse<User[]>) => {
    console.log(response.status);   // 200
    console.log(response.body);     // User[]
  });

// observe: 'events' — trả về HttpEvent<T>
this._http.get<User[]>('/api/users', { observe: 'events' })
  .subscribe((event: HttpEvent<User[]>) => {
    if (event.type === HttpEventType.Response) {
      console.log(event.body);      // User[]
    }
  });
```

## So sánh trước và sau

### Trước Angular 21

```typescript
// Cần type assertion thủ công
this._http.get('/api/users').subscribe((response: any) => {
  const users = response as User[];  // ← Không type-safe
  console.log(users);
});
```

### Sau Angular 21

```typescript
// Type-safe — không cần assertion
this._http.get<User[]>('/api/users').subscribe((users) => {
  console.log(users);  // type: User[]
});
```

## Best Practices

1. **Luôn specify generic type** — `get<User[]>()`, `post<User>()`
2. **Dùng `observe: 'response'`** khi cần access headers/status
3. **Xử lý error properly** — Type error responses
4. **Sử dụng interfaces** cho request/response types

## Tham khảo

- [Angular 21 Announcement — blog.angular.dev](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Angular HttpClient Guide](https://angular.dev/guide/http/making-requests)