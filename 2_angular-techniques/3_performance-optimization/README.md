# Performance Optimization — Tổng quan

Kỹ thuật tối ưu hiệu năng Angular v22: change detection, subscription, virtual scroll, signals.

| # | Folder | Chủ đề |
|---|---|---|
| 2 | [2-angular-change-detection/](2-angular-change-detection/README.md) | Change Detection & OnPush deep-dive (đã mở rộng) |
| 20 | [20-when-to-unsubscribe-subscription/](20-when-to-unsubscribe-subscription/README.md) | Khi nào cần unsubscribe, tránh memory leak |
| 24 | [24-table-virtual-scroll/](24-table-virtual-scroll/README.md) | Virtual scroll cho bảng dữ liệu lớn |
| 26 | [26-signals-performance/](26-signals-performance/README.md) | Performance với Signals: fine-grained reactivity, zoneless |

## Checklist nhanh

- ✅ Zoneless là mặc định từ Angular v21 — không cần Zone.js, change detection theo signals.
- ✅ Component dùng `signal()`/`input()`/`computed()` thay vì property thường.
- ✅ List lớn: `@for` + `track`, hoặc `cdkVirtualFor` với dữ liệu hàng nghìn row.
- ✅ Lazy load route + `@defer` cho khối UI nặng.
- ✅ Dùng Angular DevTools profile change detection trước khi tối ưu.

## Tham khảo

- [Change detection — angular.dev](https://angular.dev/best-practices/skipping-subtrees)
- [Zoneless](https://angular.dev/guide/zoneless)
- [Angular DevTools](https://angular.dev/devtools)
