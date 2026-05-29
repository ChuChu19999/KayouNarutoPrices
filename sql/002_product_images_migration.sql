-- Миграция с image_url в products на отдельную таблицу product_images
-- Выполните, если база создана по старой версии 001 с колонкой image_url

SET search_path TO kayou_naruto;

CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products (id) ON DELETE CASCADE,
    content BYTEA NOT NULL,
    content_type VARCHAR(127) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);

ALTER TABLE products DROP COLUMN IF EXISTS image_url;
