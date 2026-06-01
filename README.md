# Товары и цены

Одностраничное приложение для личной таблицы товаров: изображение, наименование, цена и ссылка.

## Стек

- **Backend:** FastAPI, SQLAlchemy (async), asyncpg, Pydantic, Loguru, Pendulum, orjson
- **Frontend:** React 19, TypeScript, Vite, FSD, Tanstack Query, Tanstack Table, Ant Design, Axios

## База данных

1. Создайте БД PostgreSQL.
2. Выполните `sql/init.sql` (новая база или обновление со старой схемой с `products.image_url`).
3. Укажите `DATABASE_URL` и `POSTGRES_DB_SCHEMA` в `backend/.env`.

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
