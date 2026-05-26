import { api } from './api/api';

/** Campos reales que devuelve GET /api/transactions/daily-summary */
export interface DailySummary {
  totalVentasMonto: number;  // monto total del día
  numeroVentas: number;      // cantidad de transacciones
  promedioPorVenta: number;  // ticket promedio
}

/** Campos reales que devuelve GET /api/transactions/daily-details */
export interface DailyDetail {
  _id: string;
  fecha: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
}

export const reportService = {
  /** Resumen del día: monto total, número de ventas, promedio */
  getDailySummary: async (): Promise<DailySummary> => {
    const response = await api.get('/transactions/daily-summary');
    return response.data;
  },

  /** Lista de transacciones del día con detalle */
  getDailyDetails: async (): Promise<DailyDetail[]> => {
    const response = await api.get('/transactions/daily-details');
    return response.data;
  },
};
