# CanteenGo on Vercel + Supabase

Ứng dụng CanteenGo chạy bằng HTML/CSS/JS trên Vercel. API nằm trong các Vercel Functions trong thư mục `api/` (gồm health kiểm tra riêng và catch-all `api/[...path].js`); dữ liệu được lưu trong Supabase PostgreSQL. Không cần XAMPP, PHP hoặc MySQL khi triển khai.

## 1. Tạo database Supabase

1. Đẩy thư mục này lên GitHub (GitHub web → **Add file → Upload files** cũng được).
2. Trong Vercel, chọn **New Project** và import repository.
3. Tạo project trên Supabase.
4. Trong Supabase chọn **Connect → Session pooler** và lấy PostgreSQL connection string.
5. Trong Supabase → **SQL Editor**, chạy toàn bộ file [`db/schema.sql`](db/schema.sql).

## 2. Cấu hình Vercel

Vào **Vercel → Project → Settings → Environment Variables** và thêm:

| Tên | Giá trị |
| --- | --- |
| `DATABASE_URL` | Connection string Supabase Session Pooler |
| `AUTH_SECRET` | Chuỗi bí mật ngẫu nhiên dài, tối thiểu 32 ký tự |

Chọn Production, Preview và Development nếu cần. Không đưa `DATABASE_URL` hoặc `AUTH_SECRET` vào GitHub.

## 3. Deploy và kiểm tra

Sau khi Deploy, mở (kiểm tra API trước):

```text
https://TEN-PROJECT.vercel.app/api/health
```

Kết quả:

```json
{"ok":true}
```

Để kiểm tra **database thật**, mở:

```text
https://TEN-PROJECT.vercel.app/api/db-health
```

Nếu cấu hình đúng, API trả về trạng thái kết nối Supabase PostgreSQL.

## 4. Luồng dữ liệu

```text
User / Admin / Bếp
        ↓ fetch()
Vercel API /api/[...path].js
        ↓ PostgreSQL
Supabase
        ↓
users / menu_items / orders / order_items
```

Frontend không kết nối trực tiếp bằng mật khẩu database và không lưu dữ liệu nghiệp vụ vào JSON/CSV.

## 5. Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị | `admin@uongbigo.vn` | `Admin@123` |
| Nhân viên bếp | `bep@uongbigo.vn` | `Bep@123` |
| Sinh viên | `sv@uongbigo.vn` | `sv@123` |

Hash cũ của tài khoản demo được nâng cấp tự động sang salted `scrypt` sau lần đăng nhập thành công đầu tiên. Hãy đổi hoặc xóa tài khoản demo trước khi dùng thật.

## 6. Demo giao diện

Mở `demo.html` để xem riêng giao diện khách hàng, bếp/KDS và quản trị. Demo không cần database; nút **Kiểm tra kết nối DB** chỉ dùng để kiểm tra project thật sau khi đã deploy và cấu hình Supabase.

Các trang thật sử dụng database: `menu.html` đọc món từ `menu_items`, `cart.html` tạo đơn trong `orders` + `order_items`, KDS cập nhật trạng thái đơn, Admin quản lý món/đơn/thống kê.

## 7. Chạy local

Cài Node.js 20+ rồi chạy:

```bash
npm install
npx vercel dev
```

Tạo `.env.local` từ `.env.example` và điền `DATABASE_URL`, `AUTH_SECRET`.

## 8. Lưu ý

- `DATABASE_URL` chỉ được dùng phía server trong Vercel Function.
- Không commit `.env`, mật khẩu Supabase hoặc `AUTH_SECRET`.
- QR/thanh toán trong app hiện là mô phỏng.
- Chức năng quên mật khẩu chưa tích hợp email production.
