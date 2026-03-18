# Agrawal.co — Full-Stack E-Commerce Platform

A production-ready Indian e-commerce platform with three apps: **Next.js frontend**, **Express backend**, and **React admin panel**, all backed by **MongoDB**.

---

## 📦 Project Structure

```
agrawal-co/
├── backend/        # Express.js REST API
├── frontend/       # Next.js 14 customer storefront
└── admin/          # React + Vite admin dashboard
```

---

## 🚀 Quick Start

### 1. Backend (Express + MongoDB)

```bash
cd backend
cp .env.example .env       # fill in your values
npm install
npm run dev                # runs on http://localhost:5000
```

**Required env vars:**
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — from Razorpay dashboard
- `CLOUDINARY_*` — from Cloudinary dashboard
- `SMTP_*` — Gmail app password or any SMTP provider

### 2. Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                # runs on http://localhost:3000
```

### 3. Admin Panel (React + Vite)

```bash
cd admin
cp .env.example .env
npm install
npm run dev                # runs on http://localhost:3001
```

---

## 🔑 Key Features

### Customer Frontend (Next.js 14)
- ⚡ App Router with server-side rendering & ISR
- 🔍 Full-text product search
- 🛒 Persistent cart (Zustand + localStorage)
- 💳 Razorpay payment integration
- 📦 Order tracking
- ❤️ Wishlist
- 🔐 JWT auth with Zustand store
- 📱 Fully responsive (Tailwind CSS)

### Backend (Express)
- 🔐 JWT authentication + role-based authorization
- 📦 Full CRUD for products, orders, categories, reviews
- 💰 Razorpay payment verification with signature check
- ☁️ Cloudinary image upload/delete
- 📧 Nodemailer email (order confirmation, password reset)
- 🛡️ Helmet, rate limiting, input validation
- 📊 Admin dashboard analytics aggregations

### Admin Panel (React + Vite)
- 📊 Dashboard with Chart.js revenue & order charts
- 🛍️ Product management (CRUD + image upload)
- 📋 Order management with status updates
- 👥 Customer management with suspend/activate
- 🏷️ Category management

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `User` | Customers & admins with addresses, wishlist |
| `Product` | Full product with variants, images, SEO |
| `Order` | Orders with items, payment, status history |
| `Category` | Hierarchical categories with slugs |
| `Review` | Verified purchase reviews with ratings |

---

## 💳 Payment Flow (Razorpay)

1. Frontend calls `POST /api/payments/razorpay/create-order` → gets Razorpay order ID
2. Razorpay checkout opens in browser
3. On success, frontend calls `POST /api/payments/razorpay/verify` with signature
4. Backend verifies HMAC signature → marks order as paid

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/products` | — | List products (filterable) |
| GET | `/api/products/:slug` | — | Product detail |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/my` | User | My orders |
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| PUT | `/api/orders/:id/status` | Admin | Update order status |

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | Express.js, Mongoose, JWT, Razorpay, Cloudinary, Nodemailer |
| Admin | React 18, Vite, TypeScript, Chart.js, React Router |
| Database | MongoDB |
| Payments | Razorpay (primary), Stripe (optional) |
| Images | Cloudinary |
| Hosting | Vercel (frontend), Railway/Render (backend), Netlify (admin) |

---

## 📝 License

MIT — built for Agrawal.co
