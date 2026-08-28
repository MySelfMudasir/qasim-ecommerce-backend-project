BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq;

ALTER TABLE orders
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS order_number VARCHAR(40);

UPDATE orders
SET order_number = 'INV-' || nextval('orders_order_number_seq')
WHERE order_number IS NULL;

SELECT setval(
    'orders_order_number_seq',
    COALESCE((SELECT MAX((substring(order_number from 5))::BIGINT) FROM orders WHERE order_number ~ '^INV-[0-9]+$'), 1),
    EXISTS (SELECT 1 FROM orders WHERE order_number ~ '^INV-[0-9]+$')
);

ALTER TABLE orders
    ALTER COLUMN order_number SET DEFAULT ('INV-' || nextval('orders_order_number_seq')),
    ALTER COLUMN order_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique
    ON orders (order_number);

COMMIT;
