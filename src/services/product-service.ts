import { api } from './api/api';

export interface ProductCreate {
  storeId: string;
  name: string;
  sku: string;
  nfcTagId?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  shelf?: string;
  status?: string;
}

export interface ProductUpdate {
  name?: string;
  sku?: string;
  nfcTagId?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  shelf?: string;
  status?: string;
}

export interface ProductResponse {
  _id: string;
  storeId: string;
  name: string;
  sku: string;
  nfcTagId: string;
  price: number;
  stock: number;
  minStock: number;
  shelf: string;
  status: string;
}

export const productService = {
  getProducts: async (): Promise<ProductResponse[]> => {
    const response = await api.get('/products/');
    return response.data;
  },
  createProduct: async (data: ProductCreate) => {
    const response = await api.post('/products/', data);
    return response.data;
  },
  updateProduct: async (id: string, data: ProductUpdate) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
};
