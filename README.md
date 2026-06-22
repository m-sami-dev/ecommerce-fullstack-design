# Ecommerce Fullstack Design

A full-stack eCommerce web app: React + Tailwind on the frontend, Django
REST Framework + PostgreSQL on the backend. Built to match the structure
of the brief's Figma eCommerce template (home page, product listing,
product detail, cart) with full backend integration — not just static
pages.

```
ecommerce-fullstack-design/
├── backend/     Django REST API (products, cart, auth) + admin panel
└── frontend/    React + Tailwind storefront
```

Each folder is independent and has its own README with setup steps. The
short version:

## Quick start

**1. Backend** (in one terminal)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit DB_NAME/DB_USER/DB_PASSWORD
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_products
python manage.py runserver
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env          # default already points at the backend above
npm run dev
```

Open `http://localhost:5173`. The backend API lives at
`http://127.0.0.1:8000/api/`, and the Django admin at
`http://127.0.0.1:8000/admin/`.

## What's implemented

| Feature                                   | Status |
|--------------------------------------------|--------|
| Responsive Home / Listing / Detail / Cart  | ✅ |
| Product CRUD via REST API                  | ✅ |
| Category + price filters, search, sorting  | ✅ |
| Dynamic data on every page (no hardcoding) | ✅ |
| JWT login/signup, protected routes         | ✅ |
| Cart persisted server-side per user        | ✅ |
| Admin panel (staff-only, protected routes) | ✅ |
| Sample/seed product data                   | ✅ |
| Deployment                                 | ⬜ not done — see note below |

## About deployment

This was left for you to do, since it needs your own accounts/credentials:

- **Backend**: Render or Railway both have a one-click "Deploy from GitHub"
  flow for Django + PostgreSQL; you'll set the same environment variables
  from `backend/.env.example` in their dashboard.
- **Frontend**: Vercel or Netlify — point them at the `frontend` folder and
  set `VITE_API_BASE_URL` to your deployed backend's URL.

## A note on the design

The brief's Figma file (and the screenshots you shared) were used as the
visual reference for layout and color — a blue-branded storefront with a
hero banner, category grid, filterable listing page, and a detailed product
page. The implementation isn't a pixel-for-pixel clone of the Figma file,
but follows the same structure and interactions, now wired to a real
backend instead of static/dummy content.

## Tech stack

- **Frontend**: React 19, React Router, Tailwind CSS, Axios, Vite
- **Backend**: Django 5, Django REST Framework, SimpleJWT, django-filter,
  django-cors-headers
- **Database**: PostgreSQL
