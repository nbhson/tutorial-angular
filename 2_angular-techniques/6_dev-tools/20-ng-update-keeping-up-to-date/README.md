# ng update & Keeping Up-to-Date (cập nhật 10/2026)

> **Nguồn:** [angular.dev/reference/releases](https://angular.dev/reference/releases) · [blog.angular.dev](https://blog.angular.dev)

## Tổng quan

`ng update` chạy migration schematics tự động qua từng major. Tính đến 10/2026: **Angular 22 (03/06/2026) — stable mới nhất**, **Angular 21 (19/11/2025) — LTS** (hỗ trợ đến ~06/2027), Angular 20 (28/05/2025 — EOL ~11/2026). Angular 19 và các version cũ **không còn supported** (EOL: 19/05/2026). Các phiên bản v2–v19 đã EOL hoàn toàn.

## Điểm chính

- Luôn update từng major một: `ng update @angular/core@22 @angular/cli@22`.
- Migrations v21/v22 đáng chú ý: `refactor-jasmine-vitest`, `ngClass→class`, `ngStyle→style`, `change-detection-migration` (OnPush/Eager → v22 default).
- Check `https://angular.dev/update` chọn version hiện tại → đích để có checklist.
- **Project mới 2026:** nên dùng Angular 22. Angular 19 chỉ nên đọc để hiểu lịch sử (Signals ra v16, stable v20; `linkedSignal` v19; `@Service`/`injectAsync` v22).

## Điểm chính
- Luôn update từng major một: `ng update @angular/core@22 @angular/cli@22`.
- Migrations v21/v22 đáng chú ý: `refactor-jasmine-vitest`, `ngClass→class`, `ngStyle→style`, `change-detection-migration` (OnPush/Eager).
- Check `https://angular.dev/update` chọn version hiện tại → đích để có checklist.

## Ví dụ Code

```bash
ng update                          # xem bản mới
ng update @angular/core@22 @angular/cli@22
ng generate @angular/core:change-detection-migration   # OnPush v22 (default mới)
ng generate @schematics/angular:refactor-jasmine-vitest # Vitest v21
```

## Version hiện tại (10/2026)

| Version | Trạng thái | Release | EOL / Active ends |
|---------|-----------|---------|-----------------|
| **v22** | **Stable mới nhất** | 03/06/2026 | Active ~06/2027 |
| **v21** | **LTS** | 19/11/2025 | Active ends 03/06/2026, LTS ends ~06/2027 |
| v20 | LTS | 28/05/2025 | EOL ~11/2026 |
| v19 | **EOL** | 19/11/2024 | 19/05/2026 |
| v2–v18 | **EOL** | 2016–2024 | Nhiều năm trước |

> ⚠️ Angular 19 và cũ hơn không còn nhận security patches. Nếu dự án đang dùng → lên kế hoạch migrate lên v21/v22 sớm. **Nguồn:** [angular.dev/reference/releases](https://angular.dev/reference/releases), [endoflife.date/angular](https://endoflife.date/angular).

## Tham khảo
- [Angular Release Schedule](https://angular.dev/reference/releases)
- [Angular 22 Announcement](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664)
- [Angular 21 Announcement](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)
- [Keeping up-to-date](https://angular.dev/update)
