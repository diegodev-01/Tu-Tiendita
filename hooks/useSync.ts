import { InventoryItem } from "@/src/models/inventory-item";
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { db } from "../database/db";

export const useSync = () => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("¡Internet detectado! Iniciando sincronización...");
        syncPendingSales();
      }
    });

    return () => unsubscribe();
  }, []);
};

interface Sale {
  id: number;
  transaction_id: string;
  timestamp: number;
  total_amount: number;
  payment_type: string;
  payment_status: string;
  is_synced: number;
}

const syncPendingSales = async () => {
  const pendingSales = db.getAllSync(
    "SELECT * FROM sales WHERE is_synced = 0",
  ) as Sale[];

  for (const sale of pendingSales) {
    try {
      const items = db.getAllSync(
        "SELECT * FROM sale_items WHERE sale_id = ?",
        [sale.id],
      ) as InventoryItem[];

      const saleData = {
        transaction_id: sale.transaction_id,
        timestamp: sale.timestamp,
        total_amount: sale.total_amount,
        payment_method: {
          type: sale.payment_type,
          status: sale.payment_status,
          bank_name: "",
        },
        items: items.map((item) => ({
          product_id: item.remote_id,
          nfc_uid: item.nfc_uid,
          name: item.name,
          stock: item.stock,
          price: item.price,
          subtotal: item.price * item.stock,
        })),
      };

      const response = await fetch("https://api.com/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        db.runSync("UPDATE sales SET is_synced = 1 WHERE id = ?", [sale.id]);
      }
    } catch (error) {
      console.error("Error sincronizando venta:", error);
    }
  }
};
