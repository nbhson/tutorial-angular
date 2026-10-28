# Architecture Patterns — Tổng quan

Các pattern kiến trúc áp dụng cho Angular v22: từ cấu trúc project, tách lớp, đến các mô hình state/view.

| # | Folder | Chủ đề |
|---|---|---|
| 5 | [5-angular-architecture/](5-angular-architecture/README.md) | Kiến trúc tổng thể của một Angular app |
| 6 | [6-angular-apply-mvvm-pattern/](6-angular-apply-mvvm-pattern/README.md) | Áp dụng MVVM với Angular |
| 7 | [7-angular-container-presentation-pattern/](7-angular-container-presentation-pattern/README.md) | Container/Presentation (Smart/Dumb component) |
| 10 | [10-angular-view-state-selector-pattern/](10-angular-view-state-selector-pattern/README.md) | View state selector pattern |
| 25 | [25-stop-using-service/](25-stop-using-service/README.md) | Khi nào KHÔNG nên dùng service |
| 26 | [26-port-adapters-vs-hexagonal/](26-port-adapters-vs-hexagonal/README.md) | Ports & Adapters (Hexagonal) với Angular |

## Nguyên tắc chung

- **Smart container / Dumb presentation**: component presentation nhận `input()` thuần, container lo data.
- **Signals-first**: state dùng `signal()`/`computed()`, hoặc SignalStore (NgRx) khi phức tạp.
- **Dependency Inversion**: service giao tiếp backend đặt sau interface (port) để dễ test, đổi adapter.

## Tham khảo

- [Style Guide — angular.dev](https://angular.dev/style-guide)
- [NgRx SignalStore](https://ngrx.io/guide/signals/signal-store)
