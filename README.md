# 🛍️ TechZone – Fullstack E-commerce System

Đồ án 1 | Ứng dụng mua sắm laptop trực tuyến | Fullstack với **React + Node.js + Prisma**

---

## 📘 Tổng quan

**TechZone** là một nền tảng thương mại điện tử mini, cho phép người dùng:

- Đăng ký / đăng nhập / xác thực email
- Quản lý thông tin cá nhân
- Xem và mua sản phẩm laptop
- Quản lý đơn hàng và thanh toán (trong tương lai)

Dự án bao gồm:

- 🧠 **Backend**: REST API với Node.js, Express, Prisma, JWT, Argon2
- 💻 **Frontend**: React + Vite + React-Bootstrap + Axios
- 🗄️ **Database**: MySQL

---

## ⚙️ Công nghệ chính

| Phần         | Công nghệ                               | Mô tả                            |
| ------------ | --------------------------------------- | -------------------------------- |
| **Frontend** | React, Vite, React-Bootstrap, Axios     | Giao diện web hiện đại           |
| **Backend**  | Node.js, Express.js, Prisma ORM, Argon2 | Xử lý logic & API                |
| **Auth**     | JWT, Cookies, Email Verification        | Hệ thống xác thực                |
| **Mailer**   | Nodemailer + Gmail App Password         | Gửi mail xác thực/reset password |
| **Database** | MySQL                                   | Lưu trữ dữ liệu                  |
| **Job**      | node-cron / cleanupJob                  | Xóa tài khoản chưa xác thực      |

---

## 📂 Cấu trúc dự án

```bash
TechZone/
│
├── Backend/                  # REST API chính
│   ├── src/
│   │   ├── config/           # Cấu hình (DB, mailer, dotenv, v.v.)
│   │   ├── controllers/      # Logic cho route
│   │   ├── jobs/             # Tác vụ tự động (cleanup, v.v.)
│   │   ├── lib/              # Prisma client & seed dữ liệu
│   │   ├── routes/           # Endpoint API
│   │   ├── services/         # Xử lý nghiệp vụ
│   │   └── server.js         # Entry point
│   ├── package.json
│   └── .env
│
├── Frontend/                 # Giao diện React
│   ├── src/
│   │   ├── api/              # Cấu hình Axios và các API service
│   │   ├── components/       # Component UI
│   │   ├── pages/            # Các trang chính (Login, Register, Home, v.v.)
│   │   ├── hooks/            # Custom hooks (useAuth, useFetch, ...)
│   │   └── App.jsx           # Entry point React
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── README.md
🧰 Cài đặt và chạy toàn bộ dự án
⚙️ Yêu cầu
Node.js >= 18

MySQL

Git

1️⃣ Clone project
bash
Sao chép mã
git clone https://github.com/dangngockhieu/Do_an1.git
cd Do_an1
2️⃣ Cài đặt Backend
bash
Sao chép mã
cd Backend
npm install
Tạo file .env dựa trên .env.example

3️⃣ Tạo và migrate database
bash
Sao chép mã
npx prisma migrate dev --name init
npx prisma generate
4️⃣ Seed dữ liệu mặc định
Backend sẽ tự động seed khi khởi động lần đầu.
5️⃣ Chạy Backend server
bash
Sao chép mã
npm run dev
6️⃣ Cài đặt Frontend
Mở terminal mới:

bash
Sao chép mã
cd ../Frontend
npm install
Tạo file .env trong thư mục Frontend

7️⃣ Chạy Frontend
bash
Sao chép mã
npm run dev
🔐 Các tính năng chính
Nhóm	Tính năng	Mô tả
Auth	Đăng ký / Đăng nhập / Đăng xuất	Có xác thực email và token
Email	Xác thực qua email	Gửi link xác minh
Token	Làm mới token	JWT + refresh token
Reset Password	Gửi mã đặt lại qua email	Có hạn dùng
User	Cập nhật thông tin cá nhân	Sửa đổi thông tin
Admin	Quản lý người dùng / sản phẩm	CRUD nâng cao

🧠 Dev Notes
Mật khẩu được mã hóa bằng Argon2

Token được ký bằng JWT (access + refresh)

Xác thực qua HTTP-only Cookie

Prisma được khởi tạo theo Singleton pattern để tránh leak connection
```
