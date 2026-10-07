# Angular i18n (Internationalization)

> Nguồn: https://angular.dev/guide/i18n — repo trước đây chưa có tutorial riêng

## Tổng quan
Angular i18n xử lý dịch message + format số/ngày theo chuẩn ICU. Quy trình: đánh dấu text → extract → dịch → build theo locale.

## Điểm chính
- Đánh dấu bằng thuộc tính `i18n` trong template, format ICU cho số nhiều/giới tính.
- `ng extract-i18n` sinh file `messages.xlf`; dịch ra `messages.vi.xlf`, `messages.fr.xlf`...
- Cấu hình `localize` + `i18n.locales` trong `angular.json`, build riêng từng locale.

## Ví dụ Code
```html
<!-- app.html -->
<h1 i18n="@@welcome">Welcome to our store</h1>
<p i18n>{count, plural, =0 {no items} =1 {one item} other {{{count}} items}}</p>
```

```bash
ng extract-i18n --output-path src/locale
ng build --localize
# sinh dist/vi, dist/fr...
```

```json
// angular.json (rút gọn)
{ "projects": { "my-app": { "i18n": {
  "sourceLocale": "en",
  "locales": { "vi": "src/locale/messages.vi.xlf" }
}}}}
```

## Tham khảo
- [Internationalization](https://angular.dev/guide/i18n)
