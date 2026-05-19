import { api } from './api/api';

export interface NFCItem {
  nfcTagId: string;
  quantity: number;
}

export interface TransactionCreate {
  storeId?: string;
  items: NFCItem[];
  paymentMethod: 'efectivo' | 'qr';
}

export interface TransactionResponse {
  message: string;
  id: string;
}

export const transactionService = {
  createTransaction: async (
    data: TransactionCreate,
  ): Promise<TransactionResponse> => {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  getProductByNfcTag: async (nfcTagId: string) => {
    // Busca el producto por su nfcTagId dentro de todos los productos del dueño
    const response = await api.get('/products/');
    const products: any[] = response.data;
    return products.find((p) => p.nfcTagId === nfcTagId) || null;
  },
};
