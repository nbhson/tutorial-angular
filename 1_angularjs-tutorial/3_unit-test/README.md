# Unit test 

## toBe
> Sử dụng .toBe để so sánh các giá trị nguyên thủy hoặc để kiểm tra danh tính tham chiếu của các cá thể đối tượng
- Nó gọi Object.is để so sánh các giá trị, điều này thậm chí còn tốt hơn để kiểm tra so với toán tử bình đẳng nghiêm ngặt ===
- Không sử dụng .toBe với các số dấu phẩy động. Ví dụ: do làm tròn, trong JavaScript 0,2 + 0,1 không hoàn toàn bằng 0,3. Nếu bạn có số dấu phẩy động, hãy thử .toBeCloseTo để thay thế.

### toBeCloseTo
> Mong đợi giá trị nằm trong một độ chính xác cụ thể của giá trị mong đợi.
- Chủ yếu sử dụng cho số thực

### toBeFalsy
> Mong đợi giá trị thực tế là falsy

### toBeTruthy
> Mong đợi giá trị thực tế là truthy

### toBeGreaterThan
> Mong đợi giá trị thực tế lớn hơn giá trị kỳ vọng.

### toBeGreaterThanOrEqual
> Mong đợi giá trị thực tế lớn hơn hoặc bằng giá trị kỳ vọng.

### toBeLessThan
> Mong đợi giá trị thực tế nhỏ hơn giá trị mong đợi.

### toBeLessThanOrEqual
> Mong đợi giá trị thực tế nhỏ hơn hoặc bằng giá trị kỳ vọng.

### toBeNaN
> Mong đợi giá trị thực tế là NaN

### toBeDefined
> Mong đợi giá trị thực tế được defined. (Không phải undefined)

### toBeUndefined 
> Mong đợi giá trị thực tế là không xác định.

### toBeNull
> Mong đợi giá trị thực tế là null.

### toContain
> Mong đợi giá trị thực tế chứa một giá trị cụ thể.

### toEqual 
> Mong đợi giá trị thực tế bằng với giá trị mong đợi, sử dụng deep equality comparison

### toThrow
> Mong đợi một chức năng để ném một cái gì đó.

## before - after

### beforeAll
> Chạy một function before trước khi dòng nào trong tệp này chạy

### afterAll
> Chạy một after all kiểm tra trong tệp này đã hoàn thành. Nếu hàm trả về một lời hứa hoặc là một trình tạo



## expect(value)
- Hàm mong đợi được sử dụng mỗi khi bạn muốn kiểm tra một giá trị.
- Bạn sẽ hiếm khi gọi là mong đợi của chính nó. Thay vào đó, bạn sẽ sử dụng kỳ vọng cùng với hàm "đối sánh" để khẳng định điều gì đó về giá trị.

## .not
- Nếu bạn biết cách kiểm tra điều gì đó, .not cho phép bạn kiểm tra điều ngược lại.

## beforeEach
Hàm beforeEach được gọi một lần trước mỗi thông số kỹ thuật trong hàm description() mà nó được gọi


## afterEach
Hàm afterEach được gọi một lần sau mỗi thông số kỹ thuật

## toMatch
Mong đợi giá trị thực tế khớp với một biểu thức chính quy

## toBeDefined
Mong đợi giá trị thực tế được xác định

## toBeDefined
Mong đợi giá trị thực tế là không xác định.