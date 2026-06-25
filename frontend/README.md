# Frontend — React + TailwindCSS

A responsive storefront built with React, React Router, Tailwind CSS, and Axios.

## Live URL
https://ecommerce-fullstack-design-sooty-five.vercel.app

## Pages

- **Home** — hero banner, category shortcuts, featured products
- **Shop / Product listing** — category sidebar, price filter, search, sort, pagination
- **Product detail** — gallery, price, stock, quantity picker
- **Cart** — quantities, remove items, order summary
- **Login / Signup** — JWT-based authentication (direct signup, no OTP)
- **Admin dashboard** — product management (staff users only)

## Local Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

### 3. Run dev server
```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Becoming an Admin

Sign up normally, then in Django admin set `is_staff=True` on your user. Staff users see an **Admin** link in navbar.

## Production Build
```bash
npm run build
```

## Deployment (Vercel)

Deployed on Vercel. Environment variable set: