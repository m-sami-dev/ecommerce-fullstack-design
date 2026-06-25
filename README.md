# Ecommerce Fullstack Design

A full-stack eCommerce web app: React + Tailwind on the frontend, Django REST Framework on the backend. Built to match the structure of a Figma eCommerce template (home page, product listing, product detail, cart) with full backend integration.

## 🔗 Live Demo

- **Frontend**: https://ecommerce-fullstack-design-sooty-five.vercel.app
- **Backend API**: https://msamidev2211.pythonanywhere.com/api
- **Admin Panel**: https://msamidev2211.pythonanywhere.com/admin

## Quick Start (Local Development)

**1. Backend** (in one terminal)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit as needed
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_products
python manage.py runserver
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env          # default already points at the backend
npm run dev
```

Open `http://localhost:5173`. Backend API at `http://127.0.0.1:8000/api/`, Django admin at `http://127.0.0.1:8000/admin/`.

## What's Implemented

| Feature | Status |
|---------|--------|
| Responsive Home / Listing / Detail / Cart | ✅ |
| Product CRUD via REST API | ✅ |
| Category + price filters, search, sorting | ✅ |
| Dynamic data on every page (no hardcoding) | ✅ |
| JWT login/signup, protected routes | ✅ |
| Cart persisted server-side per user | ✅ |
| Admin panel (staff-only, protected routes) | ✅ |
| Sample/seed product data (20 products) | ✅ |
| Deployed on PythonAnywhere + Vercel | ✅ |

## Tech Stack

- **Frontend**: React 19, React Router, Tailwind CSS, Axios, Vite
- **Backend**: Django 5, Django REST Framework, SimpleJWT, django-filter, django-cors-headers
- **Database**: SQLite (production), PostgreSQL (local dev optional)
- **Hosting**: PythonAnywhere (backend) + Vercel (frontend)