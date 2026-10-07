# ng update & Keeping Up-to-Date

> Nguồn: https://angular.dev/update

## Tổng quan
`ng update` chạy migration schematics tự động qua từng major (v21 → v22...), kèm `provideExperimental*` → stable cleanup.

## Điểm chính
- Luôn update từng major một: `ng update @angular/core@22 @angular/cli@22`.
- Migrations v21/v22 đáng chú ý: `refactor-jasmine-vitest`, `ngClass→class`, `ngStyle→style`, `change-detection-migration` (OnPush/Eager).
- Check `https://angular.dev/update` chọn version hiện tại → đích để có checklist.

## Ví dụ Code
```bash
ng update                          # xem bản mới
ng update @angular/core@22 @angular/cli@22
ng generate @angular/core:change-detection-migration   # OnPush v22
ng generate @schematics/angular:refactor-jasmine-vitest # Vitest v21
```

## Tham khảo
- [Keeping up-to-date](https://angular.dev/update)
