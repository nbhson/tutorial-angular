# Day 16: Angular Material — UI component library

## Muc tieu

- Cai dat va cau hinh Angular Material cho app.
- Dung cac component pho bien: Button, Input, Card, Table, Dialog, Snackbar.
- Hieu theming (M3 theme tokens, tu v17+).
- Ket hop Angular CDK (drag-drop, overlay, virtual scroll).
- So sanh voi React UI libraries (MUI, shadcn/ui).

## Khoi niem coi loi

### Angular Material la gi?

Angular Material la thu vien UI chinh thuc cua team Angular, lam theo Material Design. Diem manh: component chat luong cao, accessibility tu dong, co Angular CDK (Component Dev Kit) lam nen tang.

```bash
# Cai dat (tu v17, CLI tu cau hinh theme)
ng add @angular/material
```

CLI hoi ban chon theme (azure/blue, magenta/violet, custom) va tu dong:
1. Them dependency `@angular/material`.
2. Them typography + theme style vao `styles.scss`.
3. Them font Roboto + Material Icons vao `index.html`.

Tu v17, Material dung **Material 3 tokens** — tuy chinh bang SCSS variables:

```scss
// styles.scss — tuy chinh theme (M3)
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}
```

## Vi du chi tiet

### 1. Button + Input + Card

```ts
// login-material.component.ts
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  template: `
    <mat-card class="login-card">
      <mat-card-header><mat-card-title>Dang nhap</mat-card-title></mat-card-header>
      <mat-card-content>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
            <mat-error>Email bat buoc hoac sai dinh dang</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mat khau</mat-label>
            <input matInput formControlName="password" type="password" />
            <mat-error>It nhat 6 ki tu</mat-error>
          </mat-form-field>

          <button matButton="filled" type="submit" [disabled]="loginForm.invalid">
            Dang nhap
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .login-card { max-width: 400px; margin: 40px auto; padding: 16px; }
    .full-width { width: 100%; }
  `],
})
export class LoginMaterialComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.getRawValue());
    }
  }
}
```

### 2. Table co sort + pagination (data tu JSONPlaceholder)

```ts
// user-table.component.ts
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

interface User { id: number; name: string; email: string; }

@Component({
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule],
  template: `
    <table mat-table [dataSource]="users()" matSort>
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
        <td mat-cell *matCellDef="let user">{{ user.id }}</td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Ten</th>
        <td mat-cell *matCellDef="let user">{{ user.name }}</td>
      </ng-container>

      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let user">{{ user.email }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 20]"></mat-paginator>
  `
})
export class UserTableComponent {
  displayedColumns: string[] = ['id', 'name', 'email'];
  users = signal<User[]>([]);
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .subscribe(users => this.users.set(users));
  }
}
```

### 3. Dialog + Snackbar

```ts
// confirm-dialog.component.ts
import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Xac nhan xoa?</h2>
    <mat-dialog-content>Thao tac nay khong the hoan tac.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Huy</button>
      <button matButton="filled" [mat-dialog-close]="true">Xoa</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {}

@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatSnackBarModule],
  template: `<button matButton="filled" (click)="deleteItem()">Xoa item</button>`,
})
export class DeleteDemoComponent {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  deleteItem() {
    this.dialog.open(ConfirmDialogComponent).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // call API xoa...
        this.snackBar.open('Da xoa thanh cong', 'Hoan tac', {
          duration: 5000,
        });
      }
    });
  }
}
```

### 4. CDK Drag and Drop

```ts
// dnd-demo.component.ts
import { Component, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [DragDropModule],
  template: `
    <div class="board">
      <div class="column" cdkDropList #todoList="cdkDropList"
           [cdkDropListData]="todo()" [cdkDropListConnectedTo]="[doneList]"
           (cdkDropListDropped)="drop($event)">
        <h3>To do</h3>
        @for (item of todo(); track item.id) {
          <div class="card" cdkDrag>{{ item.title }}</div>
        }
      </div>

      <div class="column" cdkDropList #doneList="cdkDropList"
           [cdkDropListData]="done()" [cdkDropListConnectedTo]="[todoList]"
           (cdkDropListDropped)="drop($event)">
        <h3>Done</h3>
        @for (item of done(); track item.id) {
          <div class="card" cdkDrag>{{ item.title }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .board { display: flex; gap: 16px; }
    .column { width: 240px; min-height: 200px; background: #f5f5f5; padding: 8px; }
    .card { background: white; padding: 12px; margin: 8px 0; cursor: grab;
            border: 1px solid #ddd; border-radius: 4px; }
  `]
})
export class DndDemoComponent {
  todo = signal([
    { id: 1, title: 'Hoc Angular' },
    { id: 2, title: 'Viet bai tap' },
  ]);
  done = signal([
    { id: 3, title: 'Setup project' },
  ]);

  drop(event: CdkDragDrop<{ id: number; title: string }[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
```

## So sanh Angular vs React

| Khai niem | Angular | React |
|---|---|---|
| UI library chinh | Angular Material | MUI / shadcn/ui / Ant Design |
| Theming | M3 tokens (SCSS) | `ThemeProvider` / CSS variables |
| Form field | `mat-form-field` + `matInput` | TextField (MUI) |
| Table | `mat-table` + MatSort/MatPaginator | TanStack Table + MUI |
| Dialog | `MatDialog` service | `<Dialog>` component / state |
| Toast | `MatSnackBar` service | `react-hot-toast` / sonner |
| Drag & drop | CDK DragDrop | dnd-kit |
| Virtual scroll | CDK VirtualScroll | TanStack Virtual / react-window |

```tsx
// React equivalent: MUI dialog + snackbar
import { Button, Dialog, Snackbar } from '@mui/material';
import { useState } from 'react';

function DeleteDemo() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>Xoa item</Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2>Xac nhan xoa?</h2>
        <Button onClick={() => { setOpen(false); setToast(true); }}>Xoa</Button>
      </Dialog>
      <Snackbar open={toast} autoHideDuration={5000} onClose={() => setToast(false)}
                message="Da xoa thanh cong" />
    </>
  );
}
```

Khac biet quan trong: Material xu dung **service** (MatDialog.open, MatSnackBar.open) dieu khien overlay tu imperative code; React libraries xu dung **state/component** (`open` boolean + JSX). Ca hai deu ho tro signal/observable de lang nghe ket qua.

## Loi thuong gap

### 1. mat-error khong hien thi

`mat-error` chi hien thi khi control **touched va invalid**. Neu form vua load da invalid, loi se an cho den khi user touch. Neu muon hien ngay, tu kiem tra `hasError()` trong `mat-hint` hoac tu dieu kien `@if`.

### 2. Quen import module trong standalone component

Moi Material component la mot module (`MatButtonModule`, `MatInputModule`...). Quen import trong `imports: []` se bao loi "not a known element". Nho: Moi thu vien Material co module rieng, import dung thu can.

### 3. Theme khong ap dung / mau xau

Nguyen nhan: styles.scss chua include theme, hoac `ng add` bo qua buoc. Kiem tra `styles.scss` co `@include mat.theme(...)` (v17+) hoac prebuilt theme (v16-).

### 4. Dialog chua dong khi click backdrop

Mac dinh `MatDialog` dong khi click backdrop. Neu khong, co the da cau hinh `disableClose: true`. Khi dong tu dong, gia tri tra ve la `undefined` — kiem tra `afterClosed()` result truoc khi xu ly.

### 5. MatTable + data async

`[dataSource]` nhan array hoac DataSource object. Khi data la async (fetch tu API), can re-set `dataSource` hoac dung `MatTableDataSource` de co sort/pagination filter tu dong.

## Best practices

1. **Dung `ng add @angular/material`** thay vi `npm install` thu cong — CLI cau hinh theme, font, animation dung ngay tu dau.
2. **Import dung module can** trong standalone component — khong import toan bo Material.
3. **Dung mat-form-field + mat-error** de validation message tu dong hien thi dung thoi diem.
4. **Snackbar + dialog**: dung service-based API cho thao tac "imperative", danh cho notification va confirm.
5. **CDK co nhieu thu vien nho**: drag-drop, overlay, virtual-scroll, a11y — khong can Material design cung dung duoc.

## Bai tap

1. **Bai 1**: Xay dung form dang ky voi Material Input + Button. Co validation message dung `mat-error`.

2. **Bai 2**: Xay dung danh sach users voi `mat-table` + sort + pagination (data tu JSONPlaceholder).

3. **Bai 3**: Them nut xoa tren moi row. Click mo ConfirmDialog; confirm thi goi API DELETE (mock) va hien Snackbar.

4. **Bai 4**: Xay dung kanban board 2 cot voi CDK DragDrop, cho phep keo card giua 2 cot va sort trong 1 cot.

## Reference

- [Angular Material](https://material.angular.dev)
- [Getting started](https://material.angular.dev/guide/getting-started)
- [Theming (M3)](https://material.angular.dev/guide/theming)
- [Material Components catalog](https://material.angular.dev/components)
- [Angular CDK](https://material.angular.dev/cdk)
