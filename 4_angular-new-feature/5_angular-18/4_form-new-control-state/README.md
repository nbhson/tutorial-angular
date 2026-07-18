# Form Control State Change Events

## Tổng quan

Angular 18 giới thiệu property **`events`** mới trên `FormControl`, cho phép developer **subscribe vào stream events** để theo dõi các thay đổi state của form control như value changes, status changes, touch state, và pristine status. Đây là một cách declarative hơn so với việc sử dụng `valueChanges` hoặc `statusChanges` riêng lẻ.

### Trước Angular 18

```ts
// Cần subscribe riêng cho từng loại changes
control.valueChanges.subscribe(value => console.log('Value:', value));
control.statusChanges.subscribe(status => console.log('Status:', status));
```

### Angular 18+

```ts
// Subscribe vào events stream — nhận tất cả types of changes
control.events.subscribe(event => {
  if (event.type === 'valueChange') {
    console.log('Value changed to:', event.value);
  } else if (event.type === 'statusChange') {
    console.log('Control status changed to:', event.status);
  }
});
```

## Cấu trúc files

```
4_form-new-control-state/
├── src/
│   ├── app/
│   │   ├── app.component.ts              # Root component — demo events API
│   │   ├── config/
│   │   │   └── app.config.ts             # Application config
│   │   └── router/
│   │       └── app.routes.ts             # Routes
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
└── package.json
```

## Chi tiết từng file

### `src/app/app.component.ts` — Form Events Demo

Đây là file chính demo tính năng `events` trên FormControl. Component tạo reactive form với validation và subscribe vào events stream để theo dõi thay đổi.

```ts
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="submit()">
      <label for="first-name">First Name: </label>
      <input id="first-name" type="text" formControlName="firstName" />

      <label for="last-name">Last Name: </label>
      <input id="last-name" type="text" formControlName="lastName" />

      <button type="submit">Submit</button>
    </form>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class AppComponent implements OnInit, OnDestroy {
  private _subscription = new Subscription();
  readonly EMPTY_STRING = '';

  profileForm = new FormGroup({
    firstName: new FormControl<string>(this.EMPTY_STRING, [
      Validators.required,
      Validators.minLength(4),
    ]),
    lastName: new FormControl<string>(this.EMPTY_STRING),
  });

  ngOnInit(): void {
    this.fromChange();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  submit() {
    console.log(this.profileForm);
  }

  private fromChange() {
    const firstName$ = this.f['firstName'].events.subscribe((event) => {
      const value = event.source.value as string;
      const status = event.source.status;

      console.log('Value changed to:', value);
      console.log('Control status changed to:', status);

      if (status === 'INVALID' && value.includes('1')) {
        // Bước 1 — Override validators
        this.f['firstName'].setValidators([
          Validators.required,
          Validators.minLength(1)
        ]);

        // Bước 2 — Update validation state
        this.f['firstName'].updateValueAndValidity();
      }
    });

    this._subscription.add(firstName$);
  }

  get f() {
    return this.profileForm.controls;
  }
}
```

**Giải thích:**
- `events` property — 返回一个 Observable stream các events của FormControl
- `event.type` — loại event: `'valueChange'` hoặc `'statusChange'`
- `event.source` — reference đến FormControl gốc, cho phép truy cập `value`, `status`, v.v.
- **Dynamic validation**: Khi status là `INVALID` và value chứa '1', validators được override thành `minLength(1)` thay vì `minLength(4)`
- Luôn `unsubscribe` trong `ngOnDestroy` để tránh memory leaks

## Event Types trong FormControl

### valueChange

Khi giá trị của FormControl thay đổi:

```ts
control.events.subscribe(event => {
  if (event.type === 'valueChange') {
    console.log('New value:', event.source.value);
    console.log('Previous value:', event.previousValue); // Nếu có
  }
});
```

### statusChange

Khi status validation thay đổi (VALID, INVALID, PENDING, DISABLED):

```ts
control.events.subscribe(event => {
  if (event.type === 'statusChange') {
    console.log('New status:', event.source.status);
  }
});
```

## Dynamic Validation Pattern

Ví dụ thực tế — thay đổi validators theo điều kiện:

```ts
private fromChange() {
  const firstName$ = this.f['firstName'].events.subscribe((event) => {
    const value = event.source.value as string;
    const status = event.source.status;

    console.log('Value changed to:', value);
    console.log('Control status changed to:', status);

    if (status === 'INVALID' && value.includes('1')) {
      // Step 1 — Override validators
      this.f['firstName'].setValidators([
        Validators.required,
        Validators.minLength(1)
      ]);

      // Step 2 — Update the validation state of the control
      this.f['firstName'].updateValueAndValidity();
    }
  });

  this._subscription.add(firstName$);
}
```

**Flow:**
1. User nhập giá trị chứa '1' → status chuyển sang `INVALID` (vì `minLength(4)` không thỏa)
2. Events subscription detect `statusChange` → `INVALID` + value có '1'
3. Override validator thành `minLength(1)` → gọi `updateValueAndValidity()`
4. Status tự động chuyển sang `VALID` (vì length >= 1)

## So sánh: events vs valueChanges/statusChanges

| Aspect | `valueChanges` | `statusChanges` | `events` (v18+) |
|--------|---------------|-----------------|------------------|
| Value tracking | ✅ | ❌ | ✅ |
| Status tracking | ❌ | ✅ | ✅ |
| Unified stream | ❌ | ❌ | ✅ |
| Previous value | ❌ | ❌ | ✅ (event.previousValue) |
| FormControl reference | Cần inject riêng | Cần inject riêng | ✅ (event.source) |
| Event type | N/A | N/A | ✅ (valueChange/statusChange) |

## Best Practices

1. **Luôn unsubscribe** — `events` là Observable, cần unsubscribe để tránh memory leaks
2. **Sử dụng `event.source`** — Để truy cập FormControl thay vì hardcode reference
3. **Dynamic validation** — Kết hợp `setValidators()` + `updateValueAndValidity()` để thay đổi validation logic
4. **Error handling** — Wrap subscription trong error handler để tránh app crash

## Lợi ích

1. **Unified event stream** — Theo dõi cả value và status changes trong một stream
2. **Declarative** — Reactive approach phù hợp với Angular ecosystem
3. **Dynamic validation** — Dễ dàng thay đổi validators theo runtime conditions
4. **Better debugging** — Log tất cả changes trong một nơi

## Yêu cầu

- Angular 18+
- Node.js 18+

## Tài liệu tham khảo

- [Syncfusion - What's New in Angular 18](https://www.syncfusion.com/blogs/post/whats-new-in-angular-18)
- [Angular Reactive Forms Guide](https://angular.dev/guide/forms/reactive-forms)
- [FormControl API](https://angular.dev/api/forms/FormControl)