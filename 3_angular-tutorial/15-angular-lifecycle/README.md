# Day 14: Lifecycle — Component lifecycle hooks

## Muc tieu

- Hieu vong doi cua component Angular: tao -> change detection -> destroy.
- Dung dung cac hooks: `ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, `ngOnDestroy`.
- Biet hooks nao da khuyen nghi ho tro bang signal / constructor injection.
- Quan ly subscription, timer, event listener trong `ngOnDestroy`.
- So sanh voi React (`useEffect`, `useLayoutEffect`, cleanup).

## Khoi niem coi loi

### So do vong doi

```
constructor()              -> khoi tao class (khong co input binding)
ngOnChanges()              -> khi @Input thay doi (truoc ngOnInit)
ngOnInit()                 -> sau input binding dau tien (1 lan)
ngDoCheck()                -> moi chu ky change detection (hieu suat thap, can than)
ngAfterContentInit()       -> sau khi projected content (ng-content) duoc render
ngAfterContentChecked()    -> sau moi kiem tra projected content
ngAfterViewInit()          -> sau khi view cua component (va children) duoc render
ngAfterViewChecked()       -> sau moi kiem tra view
ngOnDestroy()              -> truoc khi component bi xoa bo (cleanup o day)
```

Luu y quan trong:

- `ngOnChanges` chay TRUOC `ngOnInit` o lan dau.
- `ngOnChanges` KHONG chay khi input la object bi mutate (chi khi reference doi).
- Sau v19, khi mo rong hoat dong OnPush/signal, khuyen nghi dung `input()` signal thay vi `@Input()` + `ngOnChanges`.

## Vi du chi tiet

### 1. Toan bo hooks trong mot component

```ts
// lifecycle-demo.component.ts
import {
  Component, Input, OnInit, OnChanges, DoCheck,
  AfterContentInit, AfterContentChecked,
  AfterViewInit, AfterViewChecked, OnDestroy,
} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-lifecycle-demo',
  template: `<p>Name: {{ name }}</p>`,
})
export class LifecycleDemoComponent
  implements OnChanges, OnInit, DoCheck, AfterContentInit,
             AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {

  @Input() name = '';

  constructor() {
    console.log('1. constructor - chua co input binding');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('2. ngOnChanges - input thay doi', changes);
  }

  ngOnInit() {
    console.log('3. ngOnInit - input da san sang, fetch data o day');
  }

  ngDoCheck() {
    // Chay rat nhieu lan — dung for custom check, tranh logic nang
  }

  ngAfterContentInit() {
    console.log('5. ngAfterContentInit - projected content da render');
  }

  ngAfterContentChecked() { /* moi chu ky */ }

  ngAfterViewInit() {
    console.log('7. ngAfterViewInit - view da render, co the truy cap DOM');
  }

  ngAfterViewChecked() { /* moi chu ky */ }

  ngOnDestroy() {
    console.log('9. ngOnDestroy - cleanup subscription, timer, listener');
  }
}
```

### 2. ngOnDestroy + takeUntilDestroyed — cleanup subscription

```ts
// poller.component.ts
import { Component, inject, OnDestroy, OnInit, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-poller',
  template: `<p>Server time: {{ serverTime }}</p>`,
})
export class PollerComponent implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  serverTime = '';

  ngOnInit() {
    // Poll moi 5 giay, tu dong dung khi component destroy
    interval(5000)
      .pipe(
        switchMap(() => this.http.get<{ time: string }>('/api/time')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(res => this.serverTime = res.time);
  }
}
```

### 3. Chuyen tu ngOnChanges sang input() signal (v17+)

```ts
// Cach cu — @Input + ngOnChanges
@Input() userId!: string;
ngOnChanges(changes: SimpleChanges) {
  if (changes['userId'] && !changes['userId'].firstChange) {
    this.loadUser(changes['userId'].currentValue);
  }
}

// Cach moi — input() + effect()
import { input, effect, inject } from '@angular/core';
import { UserApiService } from './user-api.service';

private api = inject(UserApiService);
userId = input.required<string>();

constructor() {
  // effect tu track input, chay lai khi userId doi
  effect(() => {
    const id = this.userId();
    this.loadUser(id);
  });
}
```

Cach moi bo di boilerplate `changes['x']` va tranh bug "quen firstChange".

### 4. afterNextRender — code chay sau khi DOM render (SSR-safe)

```ts
import { Component, afterNextRender, ElementRef, inject, viewChild } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-chart',
  template: `<canvas #canvas></canvas>`,
})
export class ChartComponent {
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    // afterNextRender: chi chay o browser, khong chay khi SSR
    // Thay the an toan cho document.getElementById trong ngOnInit
    afterNextRender(() => {
      const ctx = this.canvas().nativeElement.getContext('2d');
      ctx?.fillRect(0, 0, 100, 100);
    });
  }
}
```

### 5. Event listener tu cleanup voi DestroyRef

```ts
// resize-listener.component.ts
import { Component, inject, signal, DestroyRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-resize-listener',
  template: `<p>Window width: {{ width() }}px</p>`,
})
export class ResizeListenerComponent {
  width = signal(window.innerWidth);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const handler = () => this.width.set(window.innerWidth);
    window.addEventListener('resize', handler);

    // DestroyRef.onDestroy = ngOnDestroy nhung khong can implement interface
    destroyRef.onDestroy(() => {
      window.removeEventListener('resize', handler);
    });
  }
}
```

### 6. Thoi diem DOM: viewChild + ngAfterViewInit

```ts
import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-focus',
  template: `<input #nameInput />`,
})
export class FocusComponent implements AfterViewInit {
  nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  // Old style: @ViewChild + ngAfterViewInit
  // New style: viewChild signal — co the dung o bat ky noi nao, ca trong effect
  ngAfterViewInit() {
    this.nameInput().nativeElement.focus();
  }
}
```

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| Khi mount | `ngOnInit`, `ngAfterViewInit` | `useEffect(() => {}, [])` |
| Khi props doi | `ngOnChanges` | `useEffect(() => {}, [props.x])` |
| Cleanup | `ngOnDestroy` | return function trong `useEffect` |
| DOM sau render | `ngAfterViewInit`, `afterNextRender` | `useLayoutEffect` |
| Moi render/check | `ngDoCheck`, `ngAfterViewChecked` | (khong co — React re-render toan component) |
| Signal effect | `effect()` (v17+) | (khong co) |

```tsx
// React equivalent: load khi mount + cleanup interval
import { useEffect, useState } from 'react';

function Poller() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch('/api/time').then(r => r.json());
      setTime(res.time);
    }, 5000);

    // Cleanup = ngOnDestroy
    return () => clearInterval(id);
  }, []); // [] = chi chay 1 lan khi mount

  return <p>Server time: {time}</p>;
}
```

Diem khac biet lon nhat: React co 1 hook duy nhat (`useEffect`) phu thuoc dependency array; Angular co nhieu hooks chia nho theo giai doan. Angular v17+ signal `effect()` da gan giong React `useEffect` (tu track dependencies).

## Loi thuong gap

### 1. Logic nang trong constructor

Constructor chi dung de inject dependencies. Bat ky logic can input binding hoac DOM deu phai de o `ngOnInit` / `ngAfterViewInit`. Tranh goi API trong constructor vi input chua duoc bind.

### 2. Quen unsubscribe -> memory leak

Subscribing Observable trong component ma khong unsubscribe thi callback van chay sau khi component destroy, gay memory leak va trang thai "ghost". Dung `takeUntilDestroyed` (khuyen nghi), `async` pipe, hoac unsubscribe trong `ngOnDestroy`.

### 3. Sua DOM trong ngAfterViewChecked -> ExpressionChangedAfterItHasBeenChecked

Sua data trong `ngAfterViewChecked` hoac `ngAfterContentChecked` de dan den vong lap change detection vo han va loi `ExpressionChangedAfterItHasBeenCheckedError`. Neu can cap nhat data, dung `signal` hoac `setTimeout` / `afterNextRender`.

### 4. ngOnChanges khong chay khi object mutate

```ts
// Khong trigger ngOnChanges (chi mutate)
this.config.timeout = 3000;

// Trigger ngOnChanges (new reference)
this.config = { ...this.config, timeout: 3000 };
```

### 5. setInterval ma khong clear

Timer khong clear trong `ngOnDestroy` van chay nen memory leak. Luon clear trong cleanup.

### 6. SSR va window/document

Trong `ngOnInit` va constructor, truy cap `window` / `document` gay loi khi SSR (khong co browser API). Dung `afterNextRender()` hoac check `isPlatformBrowser(platformId)`.

## Best practices

1. **Uu tien signal input + effect()** cho logic phan ung thay doi props, giam dung `ngOnChanges`.
2. **Constructor chi inject** — logic o `ngOnInit` hoac `effect`.
3. **Cleanup la buoc bat buoc** — subscription, timer, listener phai duoc huy o `ngOnDestroy` / `DestroyRef.onDestroy` / `takeUntilDestroyed`.
4. **DOM code dua vao `afterNextRender`** (SSR-safe) thay vi truy cap DOM trong `ngOnInit`.
5. **Khong dung `ngDoCheck`** neu khong thuc su can — chay rat nhieu lan, de anh huong hieu nang.
6. **`viewChild`/`viewChildren` signal** (v17+) thay `@ViewChild` de co the dung trong `effect`.

## Bai tap

1. **Bai 1**: Viet component log toan bo lifecycle vao console. Nhap 2 instance, kiem tra thu tu hooks.

2. **Bai 2**: Viet component tao interval tang so dem 1s/lan, co nut stop + tu dong clear khi destroy (dung 3 cach: `ngOnDestroy`, `DestroyRef`, `takeUntilDestroyed`).

3. **Bai 3**: Refactor component dung `@Input` + `ngOnChanges` sang `input()` + `effect()`, kiem tra khong thay doi hanh vi.

4. **Bai 4**: Viet component do width cua window voi `resize` listener, tu cleanup, va hien thi so luong ngat chuoi khi destroy (dung `inject(Injector)` + `assertInInjectionContext` de test).

## Reference

- [Lifecycle hooks — Angular.dev](https://angular.dev/guide/components/lifecycle)
- [input() signal](https://angular.dev/guide/components/inputs)
- [effect()](https://angular.dev/guide/signals#effects)
- [DestroyRef](https://angular.dev/api/core/DestroyRef)
- [afterNextRender](https://angular.dev/api/core/afterNextRender)
- [takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)
