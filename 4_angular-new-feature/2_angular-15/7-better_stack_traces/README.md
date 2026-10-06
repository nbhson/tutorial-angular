# Better stack traces (Angular 15 x Chrome DevTools)

Angular hợp tác với Chrome DevTools dùng **async stack tagging API** để nối các async frames
và loại bỏ `zone.js` noise + linked errors. Không cần config code – xem trực tiếp trong Chrome DevTools.
Nguồn: https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8

Trước: stack lẫn `zone.js/_ZoneDelegate/invokeTask/Zone.run/resolvePromise...` gây nhiễu.

Sau: stack sạch, giữ lại frames có nghĩa (`fetch (async)`, `AppComponent_click_3_listener (app.component.html:4)`
là template listener mapping – điểm giá trị nhất để定位 lỗi).

```json
ERROR Error: Uncaught (in promise): Error
Error
    at app.component.ts:18:11
    at _ZoneDelegate.invoke (zone.js:372:26)
    at Object.onInvoke (core.mjs:26378:33)
    at _ZoneDelegate.invoke (zone.js:371:52)
    at Zone.run (zone.js:134:43)
    at zone.js:1275:36
    at _ZoneDelegate.invokeTask (zone.js:406:31)
    at resolvePromise (zone.js:1211:31)
```

```json
ERROR Error: Uncaught (in promise): Error
Error
    at app.component.ts:18:11
    at fetch (async)  
    at (anonymous) (app.component.ts:4)
    at request (app.component.ts:4)
    at (anonymous) (app.component.ts:17)
    at submit (app.component.ts:15)
    at AppComponent_click_3_listener (app.component.html:4)
```

> Bằng cách cung cấp dấu vết ngăn xếp sạch hơn và tập trung hơn, việc gỡ lỗi trở nên hiệu quả hơn và ít tốn thời gian hơn. Các nhà phát triển có thể nhanh chóng xác định nguồn lỗi hoặc ngoại lệ và hiểu rõ hơn về luồng ứng dụng của họ. Các tính năng của Angular 15 cải thiện đáng kể trải nghiệm gỡ lỗi cho các ứng dụng Angular bằng cách cung cấp ngữ cảnh rõ ràng hơn và giảm thiểu thông tin không liên quan.