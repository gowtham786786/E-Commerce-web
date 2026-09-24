# ShopMate — Enterprise E-Commerce Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**ShopMate** is a modern, high-performance e-commerce web application featuring real-time Supabase database integration, interactive 3D WebGL product visualization, two-factor authentication (2FA) with automated email OTP delivery, and an enterprise administration console.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Interactive 3D Product Showcase](#1-interactive-3d-product-showcase)
  - [Catalog & Shopping Experience](#2-catalog--shopping-experience)
  - [Admin Portal & Two-Factor Authentication](#3-admin-portal--two-factor-authentication)
  - [State Management & Persistence](#4-state-management--persistence)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Database Schema & Seeding](#database-schema--seeding)
- [Security & Best Practices](#security--best-practices)
- [License & Authors](#license--authors)

---

## Overview

ShopMate is built to deliver a consumer shopping experience with a fast, modern frontend, paired with an administrative backend. The application bridges interactive 3D rendering with scalable database queries and real-world transactional notifications.

---

## Key Features

### 1. Interactive 3D Product Showcase
- **WebGL 3D Viewer (`Three.js`)**: Real-time 3D model rendering of hero products with OrbitControls.
- **360-Degree Rotation**: Smooth mouse/touch drag navigation to inspect items from any perspective.
- **Dynamic Material Switching**: Real-time PBR color variant customization (Navy Blue, Forest Olive, Stealth Black, Desert Tan).
- **Studio Lighting & Shadows**: Ambient, directional key/fill lights, and soft contact ground drop shadows.

### 2. Catalog & Shopping Experience
- **Multi-Category Architecture**: Dedicated catalogs across *Electronics*, *Fashion*, *Home & Kitchen*, *Beauty*, *Sports*, and *Accessories*.
- **Multi-View Image Galleries**: High-resolution multi-angle perspectives for detailed product inspection.
- **Filter & Search Engine**: Real-time category filtering, search queries, price sorting, and sale badges.
- **Cart & Wishlist**: Persistent shopping cart with quantity controls, subtotal computation, and wishlist toggling.
- **Multi-Step Checkout**: Customer address entry, payment selection, and simulated order placement.

### 3. Admin Portal & Two-Factor Authentication
- **Role-Based Access Control**: Protected administrative routes verifying authenticated credentials.
- **Two-Factor Authentication (2FA)**: Single-use 6-digit verification code generated on sign-in attempts.
- **Automated Email Delivery**: Gmail SMTP transport over STARTTLS (Port 587) with multi-part plain text and anti-spam HTML templates.
- **Privacy Masking**: Email obfuscation (`r************97@gmail.com`) across portal toasts and challenge prompts.
- **Admin Dashboard**: Real-time metrics, product CRUD operations, category managers, inventory audits, order tracking, and coupon administration.

### 4. State Management & Persistence
- **Zustand Stores**: Lightweight, reactive global stores for cart items, wishlist, and user session synchronization with browser storage.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, Vite 8, JavaScript (ES Modules) |
| **Styling** | Tailwind CSS 3.4, Vanilla CSS, PostCSS, Autoprefixer |
| **3D & Graphics** | Three.js (r183), OrbitControls, GLTFLoader |
| **Icons & Motion** | Lucide React, Framer Motion |
| **State Management** | Zustand (Persistent Storage) |
| **Backend & APIs** | Node.js, Express, Nodemailer |
| **Database & Auth** | Supabase (PostgreSQL, Service Role API) |
| **Notifications** | React Hot Toast |

---

## Project Architecture

```text
E-Commerce-web/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   └── server.js               # Express API & Gmail SMTP Nodemailer service
├── data/
│   ├── catalog/                # Modular category definitions
│   │   ├── accessories.js
│   │   ├── beauty.js
│   │   ├── electronics.js
│   │   ├── fashion.js
│   │   ├── homeKitchen.js
│   │   └── sports.js
│   └── electronics_products_clean.csv
├── public/
│   ├── images/
│   │   ├── categories/         # Category imagery
│   │   └── products/           # Multi-view product photography
│   └── models/
│       └── backpack.glb        # 3D GLTF/GLB product model
├── scripts/
│   ├── seed_full_catalog.js    # Supabase category & product seeder
│   └── seed_supabase.js        # Catalog database populator
├── src/
│   ├── components/
│   │   ├── admin/              # Admin forms, sidebar, headers
│   │   ├── Bag3DViewer.jsx     # Three.js 360° interactive 3D model viewer
│   │   ├── Navbar.jsx          # Responsive header & navigation
│   │   ├── Footer.jsx          # Site footer
│   │   └── ProductCard.jsx     # Product card with cart & wishlist actions
│   ├── context/
│   │   └── AuthContext.jsx     # User authentication state provider
│   ├── hooks/
│   │   └── useProducts.js      # Supabase product query hook
│   ├── pages/
│   │   ├── admin/              # Dashboard, Orders, Products, OTP Verification
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx            # Redesigned landing page with 3D hero
│   │   ├── ProductDetail.jsx
│   │   ├── Profile.jsx
│   │   ├── Shop.jsx
│   │   └── Wishlist.jsx
│   ├── store/
│   │   ├── useCartStore.js     # Zustand cart store
│   │   └── useWishlistStore.js # Zustand wishlist store
│   ├── supabase/
│   │   └── supabase.js         # Supabase client initialization
│   ├── utils/
│   │   ├── formatCurrency.js   # INR / USD currency formatting
│   │   ├── hashOtp.js          # Client-side SHA-256 OTP hashing
│   │   └── maskEmail.js        # Email masking utility
│   ├── App.jsx                 # Route configurations
│   ├── index.css               # Global design tokens
│   └── main.jsx                # Application root mount
├── .env.example                # Sample environment template
├── .gitignore                  # Git ignore rules (secrets protected)
├── package.json                # Project dependencies & scripts
├── tailwind.config.js          # Design system color palette
└── vite.config.js              # Vite configuration
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A **Supabase** project (PostgreSQL database)
- A **Gmail** account with an App Password generated (for 2FA emails)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gowtham786786/E-Commerce-web.git
   cd E-Commerce-web
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

---

### Environment Variables

Copy the `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# API Endpoint
VITE_API_URL="http://localhost:5000"

# Supabase Credentials
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Gmail SMTP Configuration for 2FA OTP Delivery
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"
```

> **Note on Gmail App Passwords:** To send transactional OTP emails from Gmail, navigate to [Google Account Security](https://myaccount.google.com/security) &rarr; **2-Step Verification** &rarr; **App passwords**, create an app password, and assign it to `EMAIL_PASS`.

---

### Running Locally

1. **Start the Express backend server (port 5000):**
   ```bash
   npm run server
   # or: node backend/server.js
   ```

2. **In a separate terminal, start the Vite development server (port 5173):**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

4. **Access the Admin Portal:**
   Visit [http://localhost:5173/admin/login](http://localhost:5173/admin/login) to test administrative sign-in and 2FA OTP verification.

---

### Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Database Schema & Seeding

The application uses Supabase PostgreSQL to store categories and products. To seed the full catalog:

```bash
node scripts/seed_full_catalog.js
```

### Table Structure
- **`categories`**: `id`, `name`, `slug`, `image`, `created_at`
- **`products`**: `id`, `name`, `description`, `price`, `category_id`, `stock`, `images`, `rating`, `reviews_count`, `featured`, `bestseller`

---

## Security & Best Practices

- **Strict Environment Isolation**: Secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_PASS`) are guarded by `.gitignore` and are never exposed in client bundles.
- **Push Protection Compliance**: Sanitized codebase compliant with GitHub secret scanning and push protection protocols.
- **Client-Side Challenge Verification**: Admin OTP hashes are hashed via SHA-256 with 5-minute expirations and rate limiting (maximum 5 attempts).
- **Anti-Spam Deliverability**: Transactional email templates are built with standard MIME multi-part alternatives (`html` and `text`) to ensure delivery directly into primary inboxes.

---

## License & Authors

- **Author**: Gowtham ([@gowtham786786](https://github.com/gowtham786786))
- **Project**: ShopMate E-Commerce Web Application
- **License**: MIT License
