<div align="center">

<!-- Animated Header Banner -->
<img src="assets/header-animation.svg" alt="ShopMate Banner" width="100%" />

<br/><br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

**A modern, full-stack e-commerce web application featuring interactive 3D WebGL product inspection, real-time Supabase catalog, dynamic cart & checkout, and a secure admin management portal with 2FA email authentication.**

<br/>

[✨ Features](#-key-features) • [⚡ 3D Showcase](#-interactive-3d-product-showcase) • [🛡️ Admin & Security](#-admin-portal--security) • [📦 Getting Started](#-getting-started) • [🛠️ Tech Stack](#️-technology-stack) • [📧 Support](#-customer-support)

<br/>

<!-- Hero Banner Showcase -->
<img src="assets/shopmate-hero-banner.jpg" alt="ShopMate 3D Interactive Showcase" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />

</div>

---

## 🌟 Overview

**ShopMate** delivers a refined, modern shopping experience with high performance and clean aesthetics. The storefront pairs intuitive product discovery with real-time 3D product previews, instant category filtering, persistent cart and wishlist state, and an administrative control panel equipped with two-factor email authentication.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Interactive 3D Product Viewer**: Inspect products in 3D with 360° orbital drag controls and dynamic color material swatches powered by Three.js.
- **Classic Luxury Homepage**: Curated collections, 8K bespoke editorial photography, limited-release flash sale countdown, and authorized brand store ribbons.
- **Dynamic Category Filtering**: Seamlessly filter products across *Electronics, Fashion, Home & Kitchen, Beauty, Sports*, and *Accessories*.
- **Quick View Modal**: Inspect product image galleries, live stock availability, and select quantities with 1-click Add to Cart without navigating away.
- **Cart & Wishlist**: Persistent browser storage via Zustand ensures items remain intact across sessions.
- **Streamlined Checkout**: Responsive order form, address verification, coupon application, and real-time GST tax computation.

### 🛡️ Admin & Store Management
- **Two-Factor Authentication (2FA)**: Protected admin access with time-sensitive 6-digit OTP verification delivered directly to the administrator's email via Nodemailer.
- **Product Management**: Full CRUD capabilities to create, edit, update prices, manage stock, and delete catalog items.
- **Inventory & Orders**: Real-time order status tracking (Pending, Processing, Shipped, Delivered) and low-stock alerts.
- **Real-Time Store Settings**: Synchronize GST tax rates, free shipping thresholds, and store contact information dynamically across customer and admin portals.

---

## ⚡ Interactive 3D Product Showcase

The hero section features a dedicated **Three.js** canvas providing customers with an immersive 360-degree inspection of featured products:

- **Orbital Controls**: Intuitive mouse drag and mobile touch gestures to inspect the product from any angle.
- **Real-Time Material Swatches**: Instant color switching (Navy Blue, Forest Olive, Stealth Black, Desert Tan) with realistic drop shadows and ambient studio lighting.
- **Optimized Rendering**: Throttled rendering when out of viewport to preserve device memory and battery.

---

## 🛡️ Admin Portal & Security

<div align="center">
<img src="assets/shopmate-admin-dashboard.jpg" alt="ShopMate Admin Portal & 2FA Modal" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</div>

<br/>

### Two-Factor Authentication Workflow:
1. **Admin Login**: Administrator signs in at `/admin/login`.
2. **Secure OTP Generation**: The Node.js backend generates a time-limited 6-digit one-time passcode.
3. **Email Delivery**: The OTP is dispatched to the verified admin email via Gmail SMTP.
4. **Verification**: Entering the OTP unlocks the full management console with session token storage.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React 19**, **Vite 8** | Fast client-side rendering & hot-module replacement |
| **Styling** | **Tailwind CSS 3.4**, **Vanilla CSS** | Clean responsive layouts, curated luxury color palette |
| **3D Graphics** | **Three.js (r183)**, **OrbitControls** | Interactive WebGL 3D model viewport |
| **State Management** | **Zustand 5** | Persistent client storage for cart, wishlist & auth tokens |
| **Backend API** | **Node.js**, **Express 4** | RESTful endpoints, settings sync & 2FA OTP services |
| **Database** | **Supabase** (PostgreSQL) | Real-time product catalog & storage |
| **Email Services** | **Nodemailer** | Secure transactional email & OTP dispatch |
| **Icons & UI** | **Lucide React**, **React Hot Toast** | Minimalist icons & smooth toast notifications |

---

## 📦 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **Supabase Account**: (Project URL & Anon Key)
* **Gmail Account**: For 2FA OTP email delivery (with an [App Password](https://myaccount.google.com/apppasswords))

---

### Step 1: Clone the Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/gowtham786786/E-Commerce-web.git
cd E-Commerce-web

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend API Base URL
VITE_API_URL="http://localhost:5000"

# Supabase Credentials
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Gmail SMTP 2FA Email Dispatcher
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
```

---

### Step 3: Run the Development Servers

Open two terminal windows:

#### Terminal 1 — Backend API
```bash
npm run server
```

#### Terminal 2 — Frontend App
```bash
npm run dev
```

---

## 📧 Customer Support

For any technical assistance, order inquiries, or questions regarding this project:

- **Official Support Email**: [**reddygowtham397@gmail.com**](mailto:reddygowtham397@gmail.com)
- **Response Time**: Within 24 hours

---

## 👨‍💻 Author & License

* **Developer**: Gowtham ([@gowtham786786](https://github.com/gowtham786786))
* **Support**: [reddygowtham397@gmail.com](mailto:reddygowtham397@gmail.com)
* **License**: [MIT License](LICENSE)

<div align="center">
  <sub>Built with ❤️ by Gowtham. If you found this project helpful, please give it a ⭐ on GitHub!</sub>
</div>
