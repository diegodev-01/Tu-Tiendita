import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '@/src/styles/colors';

const { width } = Dimensions.get('window');

interface TimeTabProps {
  label: string;
  active?: boolean;
  isLast?: boolean;
}

interface MiniMetricProps {
  label: string;
  value: string;
  trend: string;
}

interface SaleItemProps {
  folio: string;
  time: string;
  items: string;
  method: string;
  amount: string;
  status: string;
}

const TimeTab = ({ label, active, isLast }: TimeTabProps) => (
  <TouchableOpacity style={[styles.timeTab, active && styles.timeTabActive]}>
    {label === 'Personalizado' && (
      <Feather
        name="calendar"
        size={14}
        color={active ? COLORS.white : COLORS.textMuted}
        style={{ marginRight: 4 }}
      />
    )}
    <Text style={[styles.timeTabText, active && styles.timeTabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const MiniMetric = ({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) => (
  <View style={styles.miniCard}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <MaterialCommunityIcons
        name="tag-outline"
        size={16}
        color={COLORS.primary}
      />
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
    <Text style={styles.miniValue}>{value}</Text>
    <Text style={styles.trendText}>▲ {trend}</Text>
  </View>
);

const SaleItem = ({
  folio,
  time,
  items,
  method,
  amount,
  status,
}: SaleItemProps) => (
  <View style={styles.saleCard}>
    <View style={styles.saleHeader}>
      <Text style={styles.saleTime}>{time}</Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
    <View style={styles.saleBody}>
      <View>
        <Text style={styles.saleFolio}>{folio}</Text>
        <Text style={styles.saleDetails}>
          {items} items • {method}
        </Text>
        <View style={styles.itemThumbs}>
          <View style={styles.thumbPlaceholder} />
          <View style={styles.thumbPlaceholder} />
          <View style={styles.thumbPlaceholder} />
        </View>
      </View>
      <Text style={styles.saleAmount}>${amount}</Text>
    </View>
  </View>
);

export default function ReportesScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          <TimeTab label="Hoy" />
          <TimeTab label="Semana" active />
          <TimeTab label="Mes" />
          <TimeTab label="Personalizado" />
        </ScrollView>

        <View style={styles.content}>
          {/* Card Principal - Ventas Totales */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.mainCardTitle}>Ventas Totales</Text>
              <Feather name="info" size={16} color={COLORS.textLight} />
            </View>
            <View style={styles.mainValueRow}>
              <Text style={styles.mainValue}>$24,500.00</Text>
              <View style={styles.mainTrendBadge}>
                <Text style={styles.mainTrendText}>+ 12%</Text>
              </View>
            </View>
            <Text style={styles.comparisonText}>
              vs. $21,875.00 semana pasada
            </Text>
          </View>

          {/* Grid de métricas secundarias */}
          <View style={styles.metricsGrid}>
            <MiniMetric label="Ticket Promedio" value="$185.50" trend="4.2%" />
            <MiniMetric label="Margen Est." value="32.4%" trend="1.2%" />
          </View>

          {/* Sección de Gráfico */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Ingresos por Día</Text>
              <View style={styles.legend}>
                <View
                  style={[styles.dot, { backgroundColor: COLORS.primary }]}
                />
                <Text style={styles.legendText}>Actual</Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: COLORS.textLight, marginLeft: 10 },
                  ]}
                />
                <Text style={styles.legendText}>Anterior</Text>
              </View>
            </View>
            {/* Simulación visual de gráfico */}
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartLineMock} />
              <View style={styles.chartXAxis}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <Text key={i} style={styles.xAxisText}>
                    {d}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Detalle de Ventas */}
          <View style={styles.salesSection}>
            <View style={styles.salesHeaderRow}>
              <Text style={styles.sectionTitle}>Detalle de Ventas</Text>
              <TouchableOpacity style={styles.filterBtn}>
                <Feather name="filter" size={14} color={COLORS.primary} />
                <Text style={styles.filterBtnText}>Filtros</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <Feather name="search" size={18} color={COLORS.textLight} />
              <TextInput
                placeholder="Buscar por folio, producto..."
                style={styles.searchInput}
              />
            </View>

            <SaleItem
              folio="FOL-9923"
              time="HOY, 14:30"
              items="3"
              method="Pago QR"
              amount="145.00"
              status="Completado"
            />
            <SaleItem
              folio="FOL-8022"
              time="HOY, 12:15"
              items="1"
              method="Efectivo"
              amount="25.00"
              status="Completado"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingBottom: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
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
  mainCardTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  mainValueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  mainValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  mainTrendBadge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  mainTrendText: { color: COLORS.green, fontWeight: 'bold', fontSize: 12 },
  comparisonText: { color: COLORS.textLight, fontSize: 13 },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  miniCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniLabel: { fontSize: 12, color: COLORS.textMuted, marginLeft: 5 },
  miniValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 4,
  },
  trendText: { fontSize: 12, color: COLORS.green, fontWeight: '600' },
  chartCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  legend: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontSize: 12, color: COLORS.textMuted },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chartPlaceholder: { height: 150, justifyContent: 'flex-end' },
  chartLineMock: {
    height: 80,
    backgroundColor: COLORS.primaryLight,
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
    opacity: 0.3,
    borderRadius: 10,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  xAxisText: { fontSize: 12, color: COLORS.textLight },
  salesSection: { marginBottom: 30 },
  salesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  filterBtn: { flexDirection: 'row', alignItems: 'center' },
  filterBtnText: { color: COLORS.primary, marginLeft: 5, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
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
  itemThumbs: { flexDirection: 'row', marginTop: 8 },
  thumbPlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    marginRight: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
