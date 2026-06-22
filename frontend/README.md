# Frontend — React + TailwindCSS

A responsive storefront built with React, React Router, Tailwind CSS, and Axios.

## Pages

- **Home** — hero banner, category shortcuts, featured products
- **Shop / Product listing** — category sidebar, price filter, search, sort, pagination
- **Product detail** — gallery image, price, stock, quantity picker, related products
- **Cart** — quantities, remove items, order summary (subtotal/tax/total), demo checkout
- **Login / Signup** — JWT-based authentication
- **Admin dashboard** — product table with add/edit/delete (visible only to staff users)

## 1. Install dependencies

```bash
cd frontend
npm install
```

## 2. Point it at your backend

Copy `.env.example` to `.env` if it doesn't already exist, and confirm the URL
matches where your Django server is running:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## 3. Run the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Make sure the backend (see
`../backend/README.md`) is running at the same time — the frontend calls it
directly over `fetch`/axios, there's no proxy needed since the backend has
CORS enabled for this origin.

## Becoming an admin

Sign up for an account normally, then in the backend mark that user as staff
(`python manage.py createsuperuser`, or set `is_staff=True` on an existing
user in the Django admin at `/admin/`). Staff users see an **Admin** link in
the navbar that leads to the product management dashboard.

## Build for production

```bash
npm run build
```

Output goes to `dist/`.
