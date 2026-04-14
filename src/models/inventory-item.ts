export interface InventoryItem {
  id: number;
  remote_id: string;
  nfc_uid: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  category?: string;
  updated_at: string;
}
