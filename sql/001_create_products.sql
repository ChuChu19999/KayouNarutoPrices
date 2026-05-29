-- Таблица цен продуктов Kayou Naruto
-- Выполните в своей схеме PostgreSQL (при необходимости замените kayou_naruto)

CREATE SCHEMA IF NOT EXISTS kayou_naruto;

SET search_path TO kayou_naruto;

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    product_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT products_product_url_https CHECK (product_url ~* '^https://')
);

CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products (id) ON DELETE CASCADE,
    content BYTEA NOT NULL,
    content_type VARCHAR(127) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);

COMMENT ON TABLE products IS 'Каталог продуктов Kayou Naruto с ценами';
COMMENT ON TABLE product_images IS 'Бинарные изображения продуктов (BYTEA)';
COMMENT ON COLUMN products.name IS 'Наименование (до 20 символов)';
COMMENT ON COLUMN products.price IS 'Цена';
COMMENT ON COLUMN products.product_url IS 'Ссылка на продукт (только https)';
COMMENT ON COLUMN product_images.content IS 'Содержимое файла изображения';
COMMENT ON COLUMN product_images.content_type IS 'MIME-тип (image/jpeg, image/png и т.д.)';
