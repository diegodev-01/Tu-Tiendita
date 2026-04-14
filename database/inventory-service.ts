import { InventoryItem } from "../src/models/inventory-item";
import { db } from "./db";

export const inventoryService = {
  upsertFromRemote: (item: InventoryItem) => {
    db.runSync(
      `INSERT OR REPLACE INTO inventory 
      (remote_id, nfc_uid, name, description, price, currency, stock, category, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.remote_id,
        item.nfc_uid,
        item.name,
        item.description ?? null,
        item.price,
        item.currency,
        item.stock,
        item.category ?? null,
        item.updated_at,
      ],
    );
  },

  getByNfc: (uid: string) => {
    return db.getFirstSync("SELECT * FROM inventory WHERE nfc_uid = ?", [uid]);
  },

  reduceStock: (nfc_uid: string, quantity: number) => {
    db.runSync(
      "UPDATE inventory SET stock = stock - ?, is_dirty = 1 WHERE nfc_uid = ?",
      [quantity, nfc_uid],
    );
  },
};
