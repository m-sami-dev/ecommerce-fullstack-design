# Backend — Django REST Framework + PostgreSQL

This is the API for the eCommerce project. It exposes endpoints for products,
categories, cart, and JWT-based authentication, and serves the Django admin
panel for product management.

## 1. Create and activate a virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Set up PostgreSQL

Install PostgreSQL if you don't have it, then create a database and user
(adjust names/passwords as you like):

```sql
CREATE DATABASE ecommerce_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO postgres;
```

## 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your real values:

```bash
cp .env.example .env
```

At minimum, set `DB_NAME`, `DB_USER`, `DB_PASSWORD` to match what you created
in step 3.

## 5. Run migrations

```bash
python manage.py migrate
```

## 6. Create an admin user (for the Django admin panel & admin-only API routes)

```bash
python manage.py createsuperuser
```

Any user you mark as staff (`is_staff=True`) can create/edit/delete products.
The superuser you just created is automatically staff.

## 7. Load sample product data (optional but recommended)

```bash
python manage.py seed_products
```

This creates 5 categories and 20 sample products so the frontend has
something to display immediately.

## 8. Run the server

```bash
python manage.py runserver
```

The API is now available at `http://127.0.0.1:8000/api/` and the Django
admin panel at `http://127.0.0.1:8000/admin/`.

## API reference

| Method | Endpoint                              | Auth        | Description                          |
|--------|----------------------------------------|-------------|---------------------------------------|
| GET    | `/api/products/`                      | Public      | List products (filter/search/sort)    |
| GET    | `/api/products/featured/`             | Public      | Featured products for the home page   |
| GET    | `/api/products/<slug>/`               | Public      | Single product detail                 |
| POST   | `/api/products/`                      | Staff only  | Create a product                      |
| PUT    | `/api/products/<slug>/`               | Staff only  | Update a product                      |
| DELETE | `/api/products/<slug>/`               | Staff only  | Delete a product                      |
| GET    | `/api/categories/`                    | Public      | List categories                       |
| POST   | `/api/auth/register/`                 | Public      | Create an account                     |
| POST   | `/api/auth/login/`                    | Public      | Get JWT access/refresh tokens         |
| POST   | `/api/auth/login/refresh/`            | Public      | Refresh an access token               |
| GET    | `/api/auth/me/`                       | Logged in   | Current user info                     |
| GET    | `/api/cart/`                          | Logged in   | View your cart                        |
| POST   | `/api/cart/add/`                      | Logged in   | Add `{product_id, quantity}` to cart  |
| PATCH  | `/api/cart/items/<id>/`               | Logged in   | Update item quantity                  |
| DELETE | `/api/cart/items/<id>/remove/`        | Logged in   | Remove one item                       |
| DELETE | `/api/cart/clear/`                    | Logged in   | Empty the cart                        |

Product list filters (query params): `category=<slug>`, `min_price`,
`max_price`, `in_stock=true/false`, `search=<text>`, `ordering=price`
(prefix with `-` for descending, e.g. `ordering=-price`).

## Notes

- CORS is open to `http://localhost:5173` by default (the Vite dev server
  port). Update `CORS_ALLOWED_ORIGINS` in `.env` if your frontend runs
  elsewhere.
- Product images are stored as plain URLs (`image` field) rather than
  uploaded files, to keep setup simple — sample data uses placeholder
  images. You can change this to `ImageField` later if you want real
  file uploads.
