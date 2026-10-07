# Angular Drag and Drop (CDK)

> Nguồn: https://angular.dev/guide/drag-drop + https://material.angular.dev/cdk/drag-drop

## Tổng quan
CDK `DragDropModule` cho kéo-thả, sắp xếp list, chuyển giữa lists mà không cần lib ngoài. Kết hợp tốt với `@for` + signals.

## Điểm chính
- `cdkDropList` + `cdkDrag`; sự kiện `(cdkDropListDropped)` trả `CdkDragDrop<T>`.
- Sắp xếp trong list: `moveItemInArray`; chuyển list: `transferArrayItem`.
- Thuộc tính hỗ trợ: `cdkDragBoundary`, `cdkDragLockAxis="x|y"`, `cdkDropListOrientation="horizontal"`.

## Ví dụ Code
```typescript
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  imports: [DragDropModule],
  template: `
    <div cdkDropList (cdkDropListDropped)="drop($event)">
      @for (t of tasks(); track t.id) {
        <div cdkDrag>{{ t.title }}</div>
      }
    </div>
  `,
})
export class Board {
  tasks = signal([{ id: 1, title: 'A' }, { id: 2, title: 'B' }]);
  drop(e: CdkDragDrop<{id:number;title:string}[]>) {
    const arr = [...this.tasks()];
    moveItemInArray(arr, e.previousIndex, e.currentIndex);
    this.tasks.set(arr);
  }
}
```

```bash
ng add @angular/cdk
```

## Tham khảo
- [Drag and drop](https://angular.dev/guide/drag-drop)
- [CDK DragDrop](https://material.angular.dev/cdk/drag-drop/overview)
