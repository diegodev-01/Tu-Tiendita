import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("tiendita.db");

export const initDatabase = () => {
  db.withTransactionAsync(async () => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT UNIQUE,
        nfc_uid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'BOB',
        stock INTEGER DEFAULT 0,
        category TEXT,
        updated_at TEXT,
        is_dirty INTEGER DEFAULT 0
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE,
        timestamp TEXT NOT NULL,
        total_amount REAL NOT NULL,
        payment_type TEXT, -- QR_STATIC, EFECTIVO, TARJETA
        payment_status TEXT, -- PENDING, COMPLETED, FAILED
        is_synced INTEGER DEFAULT 0
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        product_id TEXT, -- remote_id de Mongo
        nfc_uid TEXT,
        name TEXT,
        quantity INTEGER,
        unit_price REAL,
        subtotal REAL,
        FOREIGN KEY(sale_id) REFERENCES sales(id)
      );
    `);
  });
};
