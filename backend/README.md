# Backend — Django REST Framework

This is the API for the eCommerce project. It exposes endpoints for products, categories, cart, and JWT-based authentication, and serves the Django admin panel for product management.

## Live URLs
- **API**: https://msamidev2211.pythonanywhere.com/api
- **Admin**: https://msamidev2211.pythonanywhere.com/admin

## Local Setup

### 1. Create and activate a virtual environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

For local dev with SQLite (simplest):

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. Create admin user
```bash
python manage.py createsuperuser
```

### 6. Seed sample data
```bash
python manage.py seed_products
```
Creates 5 categories and 20 sample products.

### 7. Run server
```bash
python manage.py runserver
```

API available at `http://127.0.0.1:8000/api/`, admin at `http://127.0.0.1:8000/admin/`.

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products/` | Public | List products (filter/search/sort) |
| GET | `/api/products/featured/` | Public | Featured products |
| GET | `/api/products/<slug>/` | Public | Single product detail |
| POST | `/api/products/` | Staff only | Create a product |
| PUT | `/api/products/<slug>/` | Staff only | Update a product |
| DELETE | `/api/products/<slug>/` | Staff only | Delete a product |
| GET | `/api/categories/` | Public | List categories |
| POST | `/api/auth/signup/request-otp/` | Public | Register new account |
| POST | `/api/auth/login/` | Public | Get JWT tokens |
| POST | `/api/auth/login/refresh/` | Public | Refresh access token |
| GET | `/api/auth/me/` | Logged in | Current user info |
| GET | `/api/cart/` | Logged in | View cart |
| POST | `/api/cart/add/` | Logged in | Add item to cart |
| PATCH | `/api/cart/items/<id>/` | Logged in | Update item quantity |
| DELETE | `/api/cart/items/<id>/remove/` | Logged in | Remove item |
| DELETE | `/api/cart/clear/` | Logged in | Empty cart |

## Deployment (PythonAnywhere)

Deployed on PythonAnywhere free tier using SQLite database and WhiteNoise for static files. See main README for live URLs.