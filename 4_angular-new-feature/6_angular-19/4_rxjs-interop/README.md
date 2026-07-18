# 4. RxJS Interop — Custom Equality Function

## Mô tả

Angular 19 cập nhật `toSignal()` trong `@angular/core/rxjs-interop` với hỗ trợ **custom equality function**. Điều này cho phép kiểm soát chính xác khi nào signal được update từ Observable, tránh các render không cần thiết.

## Vấn đề giải quyết

```ts
// ❌ Trước Angular 19 — mỗi emission đều trigger update
const array$ = new Subject<number[]>();
const array = toSignal(array$, { initialValue: [] });

array$.next([1, 2, 3]);
array$.next([1, 2, 3]); // Trigger update dù giá trị giống hệt!
```

```ts
// ✅ Angular 19 — custom equality function
const array = toSignal(array$, {
  initialValue: [],
  equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
});
array$.next([1, 2, 3]);
array$.next([1, 2, 3]); // Không trigger update!
```

## Cú pháp

```ts
toSignal<T>(observable: Observable<T>, options?: {
  initialValue?: T;
  equal?: (a: T, b: T) => boolean;  // ← Custom equality mới
  injector?: Injector;
}): Signal<T>
```

## Files trong project

### `src/app/app.component.ts` — Demo chi tiết

```ts
import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [JsonPipe]
})
export class AppComponent implements OnInit {
  arraySubject$ = new Subject<number[]>();
  number = signal<number>(1);

  // Custom equality function — so sánh content của array
  arraysAreEqual = (a: number[], b: number[]): boolean => {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  };

  // toSignal với custom equality
  array = toSignal(this.arraySubject$, {
    initialValue: [1, 2, 3],
    equal: this.arraysAreEqual
  });

  // Computed signal — chỉ chạy lại khi array thực sự thay đổi
  checkComputed = computed(() => {
    console.log('trigger computed');
    return this.array();
  });

  ngOnInit() {
    this.arraySubject$.next([1, 2, 3]); // Không update — giống initialValue
    this.arraySubject$.next([1, 2, 3]); // Không update — giống giá trị trước
    this.arraySubject$.next([1, 2, 4]); // ✅ Update — khác giá trị

    setTimeout(() => {
      this.number.set(2); // Trigger computed riêng
    }, 3000);
  }
}
```

## Flow diagram

```
Observable emission: [1, 2, 3]
        │
        ▼
Custom equality function
  equal([1,2,3], [1,2,3]) → true
        │
        ├── true  → KHÔNG update signal (skip render)
        └── false → UPDATE signal → re-render
```

## So sánh before/after

| emission | Before (default) | After (custom equality) |
|----------|------------------|------------------------|
| `[1,2,3]` (giống initial) | Update → render | Skip → **no render** |
| `[1,2,3]` (giống prev) | Update → render | Skip → **no render** |
| `[1,2,4]` (khác) | Update → render | Update → render |

## Khi nào dùng custom equality?

- **Array signals** từ Observable (so sánh shallow)
- **Large objects** chỉ few fields thay đổi
- **Immutable data** patterns (Redux/NgRx stores)
- **Performance optimization** — giảm不必要的 renders

## Reference

- [Angular RxJS Interop Docs](https://angular.dev/guide/signals/rxjs-interop)
- [toSignal API](https://angular.dev/api/core/rxjs-interop/toSignal)
- [Angular 19 Release Notes](https://blog.angular.dev/meet-angular-v19-7b29dfd05b84)