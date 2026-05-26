import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { reportService, DailyDetail, DailySummary } from '@/src/services/report-service';
import { COLORS } from '@/src/styles/colors';

type Period = 'hoy' | 'semana' | 'mes';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mes' },
];

const METHOD_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  qr: 'Pago QR',
};

function formatTime(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  } catch {
    return '---';
  }
}

interface SaleCardProps {
  item: DailyDetail;
  index: number;
}

const SaleCard = ({ item, index }: SaleCardProps) => (
  <View style={styles.saleCard}>
    <View style={styles.saleHeader}>
      <Text style={styles.saleTime}>
        {formatDate(item.fecha)}, {formatTime(item.fecha)}
      </Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Completado</Text>
      </View>
    </View>
    <View style={styles.saleBody}>
      <View>
        <Text style={styles.saleFolio}>TXN-{String(index + 1).padStart(4, '0')}</Text>
        <Text style={styles.saleDetails}>
          {item.itemCount ?? '?'} items • {METHOD_LABEL[item.paymentMethod] ?? item.paymentMethod}
        </Text>
      </View>
      <Text style={styles.saleAmount}>Bs{(item.totalAmount ?? 0).toFixed(2)}</Text>
    </View>
  </View>
);

export default function ReportesScreen() {
  const [period, setPeriod] = useState<Period>('hoy');
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [details, setDetails] = useState<DailyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, det] = await Promise.all([
        reportService.getDailySummary(),
        reportService.getDailyDetails(),
      ]);
      setSummary(sum);
      setDetails(det);
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const ticketPromedio = summary?.promedioPorVenta ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Tabs de período ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.timeTab, period === p.key && styles.timeTabActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.timeTabText, period === p.key && styles.timeTabTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* ── Card principal: Ventas Totales ── */}
              <View style={styles.mainCard}>
                <View style={styles.mainCardHeader}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="trending-up" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.mainCardTitle}>Ventas Totales</Text>
                  <TouchableOpacity onPress={fetchData}>
                    <Feather name="refresh-cw" size={16} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
                <View style={styles.mainValueRow}>
                  <Text style={styles.mainValue}>
                    Bs{(summary?.totalVentasMonto ?? 0).toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.comparisonText}>
                  {summary?.numeroVentas ?? 0} transacciones registradas
                </Text>
              </View>

              {/* ── Grid métricas secundarias ── */}
              <View style={styles.metricsGrid}>
                <View style={styles.miniCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="tag-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.miniLabel}>Ticket Promedio</Text>
                  </View>
                  <Text style={styles.miniValue}>Bs{ticketPromedio.toFixed(2)}</Text>
                </View>
                <View style={styles.miniCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="receipt" size={16} color={COLORS.primary} />
                    <Text style={styles.miniLabel}>Transacciones</Text>
                  </View>
                  <Text style={styles.miniValue}>{summary?.numeroVentas ?? 0}</Text>
                </View>
              </View>

              {/* ── Detalle de ventas del día ── */}
              <View style={styles.salesSection}>
                <View style={styles.salesHeaderRow}>
                  <Text style={styles.sectionTitle}>Detalle de Ventas</Text>
                  <TouchableOpacity style={styles.filterBtn} onPress={fetchData}>
                    <Feather name="refresh-cw" size={14} color={COLORS.primary} />
                    <Text style={styles.filterBtnText}>Actualizar</Text>
                  </TouchableOpacity>
                </View>

                {details.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Feather name="shopping-bag" size={32} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>
                      No hay ventas registradas hoy.{'\n'}¡Escanea productos para comenzar!
                    </Text>
                  </View>
                ) : (
                  details.map((item, index) => (
                    <SaleCard key={item._id ?? index} item={item} index={index} />
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingBottom: 50 },
  tabsScroll: { paddingLeft: 20, marginVertical: 15, maxHeight: 45 },
  timeTab: {
    paddingHorizontal: 20,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeTabActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  timeTabText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },
  timeTabTextActive: { color: COLORS.white },
  content: { paddingHorizontal: 20 },
  mainCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mainCardTitle: { flex: 1, fontSize: 16, color: COLORS.textMuted, fontWeight: '500' },
  mainValueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  mainValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  comparisonText: { color: COLORS.textLight, fontSize: 13 },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  miniLabel: { fontSize: 12, color: COLORS.textMuted, marginLeft: 5 },
  miniValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  salesSection: { marginBottom: 30 },
  salesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  saleCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  saleTime: { fontSize: 11, color: COLORS.textLight, fontWeight: 'bold' },
  statusBadge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: { color: COLORS.green, fontSize: 10, fontWeight: 'bold' },
  saleBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  saleFolio: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  saleDetails: { fontSize: 12, color: COLORS.textMuted, marginVertical: 4 },
  saleAmount: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
});
