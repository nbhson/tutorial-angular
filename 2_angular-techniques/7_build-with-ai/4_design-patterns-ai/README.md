# Design Patterns (AI)

> Nguồn: https://angular.dev/ai/design-patterns

## Tổng quan
Patterns chuẩn để AI (và dev) sinh code Angular hiện đại: signal-first, container/presentation, `resource` cho async, Signal Forms.

## Điểm chính
- Async data: `resource()`/`httpResource()` (stable v22) thay `subscribe` thủ công trong component.
- State: `signal` + `computed` + `linkedSignal(set)` cho derived writable state.
- Forms: Signal Forms `form()` + typed validators (stable v22) thay `FormGroup` cũ cho form mới.
- DI: `inject()` + `@Service` (v22) thay constructor injection dài.

## Ví dụ Code
```typescript
// ❌ Pattern cũ AI hay sinh
export class Users implements OnInit {
  users: User[] = [];
  ngOnInit() { this.http.get<User[]>('/api/users').subscribe(u => this.users = u); }
}

// ✅ Pattern chuẩn v22
export class Users {
  private http = inject(HttpClient);
  users = httpResource<User[]>(() => '/api/users');
  // template: @if (users.isLoading()) {...} @else { @for (u of users.value() ?? []; ...) }
}
```

```typescript
// linkedSignal với set tùy biến (v22)
const celsius = signal(25);
const fahrenheit = linkedSignal({
  source: celsius,
  computation: c => c * 9/5 + 32,
  set: (f, rawSet) => rawSet((f - 32) * 5/9), // viết ngược về source
});
```

## Tham khảo
- [Design Patterns](https://angular.dev/ai/design-patterns)
- `4_angular-new-feature/9_angular-22/3_resource-httpresource-stable/`, `7_linkedsignal-set/`
