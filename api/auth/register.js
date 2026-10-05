// api/auth/register.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password, email } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }

    try {
      // 1. Kiểm tra user đã tồn tại chưa trong Database (Supabase)
      // 2. Hash mật khẩu (khuyến nghị dùng bcrypt)
      // 3. Lưu user mới vào Database
      
      res.status(201).json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi server khi đăng ký.' });
    }
  } else {
    res.status(405).json({ error: 'Không tìm thấy endpoint.' });
  }
}
