import { api } from './api/api';

export interface DailySummary {
  totalVentasMonto: number;
  numeroVentas: number;
  promedioPorVenta: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  sold: number;
  price: string;
}

export interface Alert {
  id: string;
  name: string;
  level: string;
  critical: boolean;
}

export const getDashboardData = async (): Promise<{
  dailySummary: DailySummary;
  topProducts: Product[];
  stockAlerts: Alert[];
}> => {
  const [summaryRes, topRes, productsRes] = await Promise.all([
    api.get('/transactions/daily-summary'),
    api.get('/transactions/top-products'),
    api.get('/products/'),
  ]);

  const dailySummary = summaryRes.data;
  const products = productsRes.data;

  const topProducts = topRes.data.map((top: any) => {
    const prod = products.find((p: any) => p._id === top._id);
    return {
      id: top._id,
      name: top.nombre,
      sku: prod ? `SKU:${prod.sku}` : '',
      sold: top.cantidadVendida,
      price: prod ? `Bs${prod.price.toFixed(2)}` : 'Bs0.00',
    };
  });

  const stockAlerts = products
    .filter((p: any) => p.stock === 0 || p.stock <= p.minStock)
    .map((p: any) => ({
      id: p._id,
      name: p.name,
      level: p.stock === 0 ? 'Agotado' : `Queda${p.stock === 1 ? '' : 'n'} ${p.stock}`,
      critical: p.stock === 0,
    }));

  return {
    dailySummary,
    topProducts,
    stockAlerts,
  };
};
