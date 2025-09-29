CREATE TABLE businesses (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id INTEGER PRIMARY KEY NOT NULL,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  dui TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE invoice_status(
  id INTEGER PRIMARY KEY NOT NULL,
  status_name TEXT NOT NULL
);

INSERT INTO invoice_status(status_name) VALUES
  ('pending'),
  ('paid'),
  ('cancelled');

DROP TABLE invoice;
CREATE TABLE invoice (
  id INTEGER PRIMARY KEY NOT NULL,
  business_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  total DECIMAL(10,2) NOT NULL,
  status_id INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (status_id) REFERENCES invoice_status(id)
);

CREATE TABLE products(
  id INTEGER PRIMARY KEY NOT NULL,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE invoice_items(
  id INTEGER PRIMARY KEY NOT NULL,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (invoice_id) REFERENCES invoice(id)
);

ALTER TABLE businesses ADD COLUMN refresh_token TEXT DEFAULT NULL;
ALTER TABLE businesses DROP COLUMN refresh_token;

ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;