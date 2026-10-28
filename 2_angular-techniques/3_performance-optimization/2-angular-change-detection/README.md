# Change Detection & ChangeDetectionStrategy.OnPush — Deep dive

> Nguồn: https://angular.dev/best-practices/skipping-subtrees — https://angular.dev/guide/zoneless — https://angular.dev/api/core/ChangeDetectionStrategy

## Change detection là gì?

Change detection (CD) là cơ chế Angular **kiểm tra sự thay đổi của state để cập nhật DOM** — đồng bộ giữa model và giao diện. Mỗi component có một "người soi" riêng; toàn bộ cây component được quét theo thứ tự từ trên xuống.

Ba nguồn kích hoạt change detection:

- DOM events (click, keyup, submit...) trên các node trong component
- XHR/fetch/HttpClient callback, Promise
- Timer: `setTimeout()`, `setInterval()`

## Hai chiến lược

| Chiến lược | Khi nào chạy check | Dùng khi |
|---|---|---|
| `Default` (và `Eager` — tên mới từ v22) | Mọi lần CD chạy trong cây | Component có state đổi từ nhiều nguồn |
| `OnPush` | Chỉ khi input/reference thay đổi, hoặc sự kiện phát sinh trong component | Mọi component thuần hiển thị (phần lớn app) |

> **Mới từ Angular v22**: `OnPush` là **mặc định** cho mọi component — bạn không cần khai báo `changeDetection: ChangeDetectionStrategy.OnPush` nữa. Chỉ khi bạn **tự chọn** `ChangeDetectionStrategy.Eager` (tên mới của `Default`) component mới bị qu mỗi lần cả cây quét. Rule `prefer-on-push-component-change-detection` của angular-eslint cũng chỉ cảnh báo khi bạn chủ động opt-out khỏi OnPush.

## OnPush hoạt động thế nào?

Với `OnPush`, component chỉ được qu change detection khi **một trong các điều kiện** xảy ra:

1. Một trong các `@Input` (signal input hoặc property thường) nhận **reference mới**.
2. Một event binding trong template (hoặc của con cháu nó) được phát sinh.
3. Bạn chủ động đánh dấu qua `markForCheck()` (hoặc dùng signal — signal tự làm điều này).

### Ví dụ trực quan

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
  `,
  // Từ v22 mặc định đã là OnPush — dòng này chỉ cần khi muốn ghi rõ hoặc opt-out
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user = input.required<User>(); // signal input
}
```

```typescript
// ❌ Mutate object — OnPush không phát hiện (reference không đổi)
this.user.name = 'Tên mới';

// ✅ Tạo reference mới — Angular phát hiện và render lại
this.user = { ...this.user, name: 'Tên mới' };
// hoặc với immutable update qua service/store: state = { ...state, user: newUser }
```

### Nhánh nào bị "đóng băng"?

`OnPush` chỉ tắt **subtree** của component đó. Con cháu của một component `Default` (Eager) vẫn bị qu theo nhịp của zone/scheduler. Kết hợp hai lớp:

```
App (Eager/Default)
└── Layout (OnPush)          ← chỉ render khi input đổi hoặc event
    ├── SearchBar (Eager)    ← vẫn bị qu khi gõ phím... tránh!
    └── ResultList (OnPush)  ← an toàn
```

> Từ Angular v22, không còn "mặc định Eager" nữa — app mới gần như toàn OnPush trừ khi bạn chủ động đổi. Đây là một trong những thay đổi lớn về change detection của v22.

## markForCheck vs detectChanges

```typescript
import { ChangeDetectorRef } from '@angular/core';

export class ChartComponent {
  private cdr = inject(ChangeDetectorRef);
  data: number[] = [];

  ngOnInit() {
    // ❗ Callback nằm ngoài Zone — Angular "không biết" data đã đổi
    someLegacyLibrary.onUpdate((newData) => {
      this.data = newdata;
      this.cdr.markForCheck(); // ✅ báo cho Angular: "component này cần được qu"
    });
  }
}
```

- **`markForCheck()`**: đánh dấu component **và mọi ancestor** lên tới root là "cần kiểm tra" ở lần change detection kế tiếp. Không qu ngay — chỉ "đặt cờ".
- **`detectChanges()`**: quét **ngay** component hiện tại + con cháu (bất kể OnPush), không đi lên cha. Dùng khi bạn muốn update DOM ngay lập tức (ví dụ trước một chuyển động animation).

Với **signal**, hai hàm này gần như không cần nữa: gán `signal.set(...)` bên trong template binding đã tự trigger — đây là lý do signals + zoneless thay thế phần lớn code `markForCheck` cũ.

## OnPush + RxJS: async pipe

`async` pipe tự động `markForCheck` khi Observable phát giá trị — combo kinh điển với OnPush:

```typescript
@Component({
  template: `
    @for (item of users$ | async; track item.id) {
      <app-user-row [user]="item" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  users$ = inject(UserService).getAll();
}
```

Với Angular 22, dùng `toSignal`/`resource` thay thế sẽ gọn hơn:

```typescript
private userService = inject(UserService);
users = this.userService.users(); // signal — tự track, không cần async pipe
```

## Các cạm bẫy khi bật OnPush

1. **Mutate input object/array**: dùng `{ ...obj }`, `[...arr]` — hoặc chuyển sang signal input.
2. **Dùng service mutate state nhưng component quên signal**: với zoneless, service phải expose signal, không thể chỉ "gán biến".
3. **Third-party callback ngoài zone**: vẫn cần `markForCheck`/`NgZone.run` — hoặc wrap bằng `runOutsideAngular` rồi `markForCheck`.
4. **Quên `[ngModel]`/form event** không kích hoạt change detection như bạn nghĩ — kiểm tra bằng Angular DevTools (Flame graph) trước khi kết luận.

## Kết hợp Zoneless (v21+)

Từ v21 zoneless là **mặc định** cho app mới (`ng new` không còn cài Zone.js). Khi đó:

- Change detection chỉ chạy khi có signal thay đổi, event trong template, hoặc `markForCheck` được gọi rõ ràng.
- `setTimeout`/Promise trong code thường **không** kích hoạt render — đây là khác biệt lớn nhất so với các app có Zone.
- Công cụ profile: Angular DevTools → tab *Change Detection* để xem chính xác component nào bị qu bao nhiêu lần.

```typescript
// main.ts / app.config.ts — zoneless (mặc định từ v21, v22 giữ nguyên)
import { provideZonelessChangeDetection } from '@angular/core';

providers: [provideZonelessChangeDetection()];
```

## Checklist

- [ ] Mọi component dùng `input()`/signal — không mutate input.
- [ ] Callback ngoài Angular (thư viện legacy) có `markForCheck()`.
- [ ] Hiển thị dữ liệu qua signal/computed, không qua property thường.
- [ ] Đã bật zoneless (hoặc đã chọn OnPush cho từng component khi chạy với zone).
- [ ] Profile bằng Angular DevTools trước khi tối ưu sâu.

## Tham khảo

- [angular.dev — Skipping subtrees with OnPush](https://angular.dev/best-practices/skipping-subtrees)
- [Zoneless](https://angular.dev/guide/zoneless)
- [ChangeDetectionStrategy API](https://angular.dev/api/core/ChangeDetectionStrategy)
- [Angular DevTools](https://angular.dev/devtools)
