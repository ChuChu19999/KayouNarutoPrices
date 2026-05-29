# Kayou Naruto Prices

Одностраничное приложение для каталога цен продуктов Kayou Naruto: таблица с изображением, наименованием, ценой и ссылкой.

## Стек

- **Backend:** FastAPI, SQLAlchemy (async), asyncpg, Pydantic, Loguru, Pendulum, orjson
- **Frontend:** React 19, TypeScript, Vite, FSD, Tanstack Query, Tanstack Table, Ant Design, Axios

## База данных

1. Создайте БД PostgreSQL.
2. Для новой БД выполните `sql/001_create_products.sql`.
3. Если БД уже была с колонкой `products.image_url`, выполните `sql/002_product_images_migration.sql` (старые URL не переносятся — загрузите изображения заново).
4. Укажите `DATABASE_URL` и `POSTGRES_DB_SCHEMA` в `backend/.env`.

Изображения хранятся в таблице `product_images` (поле `BYTEA`), не по URL.

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

API:

- `GET /api/products/` — список
- `POST /api/products/` — создание (multipart: `name`, `price`, `productUrl`, `image`)
- `PATCH /api/products/{id}` — изменение (multipart, `image` опционально)
- `DELETE /api/products/{id}` — физическое удаление продукта и изображения
- `GET /api/products/{id}/image` — бинарное изображение

Swagger: `http://localhost:8000/api/docs`, health: `/api/health/`.

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm start
```
