# Tại sao angular lại tự động run detection trên (click) mà addEventListener thì lại không?

> Phạm vi bài này: **Zone app (có zone.js, dùng `NgZone.run`)** vs **zoneless app (v18 experimental, không có zone.js)**.
> - **Zone app**: `NgZone.run()` / `ChangeDetectorRef` đều trigger được change detection; `(click)` binding được Zone.js patch nên auto-detect, còn native `addEventListener` thì không.
> - **Zoneless app**: không có `NgZone` — chỉ các triggers của `ChangeDetectionScheduler` mới schedule được (bound listeners trong template, signal update, `markForCheck()`/`detectChanges()`, `setInput()`, attach/remove view, render hook). `NgZone.run()` không còn ý nghĩa, phải dùng `ChangeDetectorRef` hoặc Signals.

Đây là một câu hỏi rất hay về cơ chế hoạt động bên trong của Angular. 

## ngZone

1. Angular Event Binding

```ts
// Angular tự động wrap event handler trong Zone.js
<button (click)="counter++">Click</button>

// Bên trong Angular làm như sau:
Zone.current.run(() => {
  // Event handler được thực thi trong NgZone
  this.counter++;
  // Sau đó trigger change detection
});
```

Với Angular Event Binding

```ts
@Component({
  template: `<button (click)="onClick()">Click</button>`
})
class MyComponent {
  onClick() {
    // Tự động chạy trong NgZone vì:
    // 1. Angular đã wrap event binding
    // 2. Zone.js theo dõi event này
    // 3. Trigger change detection sau khi handler thực thi
  }
}
```
2. addEventListener

```ts
// Native DOM API, không biết gì về Angular
button.addEventListener('click', () => {
  // Chạy ngoài NgZone
  this.counter++;
  // Không có change detection
});
```

Với JS addEventListener

```ts
ngOnInit() {
  button.addEventListener('click', () => {
    // Chạy ngoài NgZone
    // Zone.js không biết về event listener này
    // Không có change detection
  });
}
```

## Cách fix cho addEventListener:

Sử dụng NgZone:

```ts
constructor(private ngZone: NgZone) {}

ngOnInit() {
  button.addEventListener('click', () => {
    this.ngZone.run(() => {
      // Bây giờ code sẽ chạy trong NgZone
      this.counter++;
      // Và trigger change detection
    });
  });
}
```

Sử dụng ChangeDetectorRef:

```ts
constructor(private cd: ChangeDetectorRef) {}

ngOnInit() {
  button.addEventListener('click', () => {
    this.counter++;
    this.cd.detectChanges(); // Manual trigger change detection
  });
}
```

## Flow của Event Processing:

Angular Event Binding:

```bash
1. Event xảy ra
2. Angular event handler (đã được wrap bởi Zone.js) được gọi
3. Code chạy trong NgZone
4. Change detection tự động trigger
5. UI update
```

Native addEventListener:

```bash
1. Event xảy ra
2. Native event handler được gọi
3. Code chạy ngoài NgZone
4. Không có change detection
5. UI không update
```