// Đường dẫn file: api/menu.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Chuẩn hóa dữ liệu món ăn để tương thích cả camelCase lẫn snake_case
function normalizeItem(row) {
  const id = row.id ?? row.ma_mon ?? row.mon_id;
  const tenMon = row.ten_mon ?? row.tenMon ?? row.name ?? row.title ?? "Món ăn";
  const gia = Number(row.gia ?? row.don_gia ?? row.donGia ?? row.price ?? 0);
  const moTa = row.mo_ta ?? row.moTa ?? row.description ?? "";
  const hinhAnh = row.hinh_anh ?? row.hinhAnh ?? row.image_url ?? row.image ?? "";
  const danhMuc = row.danh_muc ?? row.danhMuc ?? row.loai_mon ?? row.category ?? "Món chính";
  const conHang = row.con_hang ?? row.conHang ?? row.trang_thai ?? row.is_available ?? true;

  return {
    ...row,
    id,
    ten_mon: tenMon,
    tenMon,
    name: tenMon,
    gia,
    don_gia: gia,
    donGia: gia,
    price: gia,
    mo_ta: moTa,
    moTa,
    description: moTa,
    hinh_anh: hinhAnh,
    hinhAnh,
    image: hinhAnh,
    danh_muc: danhMuc,
    danhMuc,
    category: danhMuc,
    con_hang: conHang,
    conHang,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const client = await pool.connect();
  try {
    // Tự động tìm bảng chứa món ăn trong schema public của Supabase
    const candidateTables = ["mon_an", "menu", "menu_items", "dishes", "san_pham", "items"];
    let targetTable = null;

    for (const tableName of candidateTables) {
      const check = await client.query(
        `SELECT to_regclass($1) AS exists`,
        [`public.${tableName}`]
      );
      if (check.rows[0]?.exists) {
        targetTable = tableName;
        break;
      }
    }

    if (!targetTable) {
      return res.status(500).json({
        ok: false,
        message: "Chưa tìm thấy bảng món ăn trong Supabase. Hãy chắc chắn bạn đã chạy file db/schema.sql.",
      });
    }

    // Lấy danh sách món ăn (GET)
    if (req.method === "GET") {
      const result = await client.query(`SELECT * FROM ${targetTable} ORDER BY 1 ASC`);
      const items = result.rows.map(normalizeItem);

      return res.status(200).json({
        ok: true,
        items,
        data: items,
        menu: items,
        monAn: items,
      });
    }

    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  } catch (err) {
    console.error("Lỗi tại /api/menu:", err);
    return res.status(500).json({
      ok: false,
      message: "Lỗi khi tải danh sách thực đơn từ Supabase.",
      detail: err.message,
    });
  } finally {
    client.release();
  }
};
