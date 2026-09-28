# CanteenGo - Supabase + Vercel

## 1. Tạo database trong Supabase

1. Tạo một project trên Supabase.
2. Mở **SQL Editor**.
3. Mở file `db/schema.sql` trong project này và chạy toàn bộ nội dung.
4. Kiểm tra các bảng `users`, `menu_items`, `orders`, `order_items` đã xuất hiện trong **Table Editor**.

## 2. Lấy connection string

Trong Supabase chọn **Connect** → **Session pooler** (khuyến nghị cho serverless/Vercel).

Connection string có dạng:

```text
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require
```

Không đưa connection string vào HTML, JavaScript phía client hoặc GitHub public.

## 3. Cấu hình Vercel

Vào **Vercel → Project → Settings → Environment Variables** và tạo:

- `DATABASE_URL` = connection string Supabase Session Pooler
- `AUTH_SECRET` = chuỗi bí mật dài, ngẫu nhiên

Chọn Environment phù hợp (Production, Preview, Development).

Sau khi thêm/sửa biến môi trường, **Redeploy** project.

## 4. Cách dữ liệu được lưu

```text
User/Admin/Bếp
    ↓ fetch()
Vercel API: /api/[...path].js
    ↓ PostgreSQL
Supabase
    ↓
users / menu_items / orders / order_items
```

Trang HTML không kết nối trực tiếp vào database và không lưu dữ liệu vào JSON/CSV.

## 5. Kiểm tra sau deploy

Mở:

```text
https://TEN-DOMAIN-VERCEL.vercel.app/api/health
```

Kết quả mong đợi:

```json
{"ok":true}
```

Sau đó đăng nhập Admin → quản lý món → thêm món. Món mới phải xuất hiện trong Supabase → Table Editor → `menu_items`.

## 6. Lưu ý bảo mật

Không commit `.env`, `DATABASE_URL`, mật khẩu Supabase hoặc `AUTH_SECRET` lên GitHub. Chỉ lưu chúng trong Vercel Environment Variables.
