import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '@/src/services/api/api';
import { getDashboardData, Product, Alert } from '@/src/services/dashboard-service';
import { COLORS } from '@/src/styles/colors';
import { useFocusEffect, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const SALES_TREND = [38, 52, 45, 67, 55, 72, 80];

function TrendLine() {
  const points = SALES_TREND;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const chartW = width - 64;
  const chartH = 48;
  const stepX = chartW / (points.length - 1);

  const coords = points.map((v, i) => ({
    x: i * stepX,
    y: chartH - ((v - min) / (max - min)) * chartH,
  }));

  return (
    <View style={{ height: chartH + 8, marginTop: 8 }}>
      {coords.map((pt, i) => {
        if (i === coords.length - 1) return null;
        const next = coords[i + 1];
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y + 4,
              width: len,
              height: 2,
              backgroundColor: COLORS.chartLine,
              borderRadius: 1,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 50%',
            }}
          />
        );
      })}
      {coords.map((pt, i) => (
        <View
          key={`dot-${i}`}
          style={{
            position: 'absolute',
            left: pt.x - 3,
            top: pt.y + 1,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: COLORS.chartLine,
          }}
        />
      ))}
    </View>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ProductRow({ item }: { item: Product }) {
  return (
    <View style={styles.productRow}>
      {/* Ícono de producto (cuadrado de color) */}
      <View style={styles.productIcon}>
        <View style={styles.productIconInner} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productSold}>{item.sold} vendidos hoy</Text>
      </View>
      <Text style={styles.productPrice}>{item.price}</Text>
    </View>
  );
}

function AlertRow({ item }: { item: Alert }) {
  return (
    <View style={styles.alertRow}>
      <View
        style={[
          styles.alertDot,
          { backgroundColor: item.critical ? COLORS.red : COLORS.amber },
        ]}
      />
      <Text style={styles.alertName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text
        style={[
          styles.alertLevel,
          { color: item.critical ? COLORS.red : COLORS.amber },
        ]}
      >
        {item.level}
      </Text>
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [dailySummary, setDailySummary] = useState({
    totalVentasMonto: 0,
    numeroVentas: 0,
    promedioPorVenta: 0,
  });
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [stockAlerts, setStockAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDailySummary(data.dailySummary);
      setTopProducts(data.topProducts);
      setStockAlerts(data.stockAlerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Resumen de Hoy ── */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>RESUMEN DE HOY</Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendBadgeText}>+12% vs ayer</Text>
              </View>
            </View>

            <Text style={styles.totalAmount}>Bs{dailySummary.totalVentasMonto.toFixed(2)}</Text>
            <Text style={styles.summarySubtitle}>Ventas Totales</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dailySummary.numeroVentas}</Text>
                <Text style={styles.statLabel}>Transacciones</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Bs{dailySummary.promedioPorVenta.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Promedio por día</Text>
              </View>
            </View>
          </View>

        {/* ── Tendencia 7 días ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tendencia de Ventas (7 Días)</Text>
            <TouchableOpacity>
              <IconSymbol
                name="arrow.up.right.square"
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
          <TrendLine />
        </View>

        {/* ── Acciones Rápidas ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ACCIONES RÁPIDAS</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIcon}>
                <IconSymbol
                  name="dot.radiowaves.left.and.right"
                  size={22}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.actionLabel}>Escanear NFC</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIcon}>
                <IconSymbol name="qrcode" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Escanear QR</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* ── Más Vendidos ── */}
        <View style={styles.card}>
          <SectionTitle title="Más Vendidos" action="Ver todos" />
          {topProducts.length === 0 ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>No hay ventas registradas hoy.</Text>
          ) : (
            topProducts.map((item) => <ProductRow key={item.id} item={item} />)
          )}
        </View>

        {/* ── Alertas de Stock ── */}
        <View style={[styles.card, styles.alertCard]}>
          <View style={styles.alertHeader}>
            <View style={styles.alertTitleRow}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={16}
                color={COLORS.red}
              />
              <Text style={[styles.cardTitle, { marginLeft: 6 }]}>
                Alertas de Stock
              </Text>
            </View>
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{stockAlerts.length}</Text>
            </View>
          </View>

          {stockAlerts.length === 0 ? (
            <Text style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8 }}>
              No hay alertas de stock.
            </Text>
          ) : (
            stockAlerts.map((item) => <AlertRow key={item.id} item={item} />)
          )}

          <TouchableOpacity
            style={styles.repoBtn}
            onPress={() => router.push('/(tabs)/Inventory')}
          >
            <Text style={styles.repoBtnText}>→ Ir a Reposición</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 50,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Tarjeta resumen principal (roja)
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  trendBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  trendBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  totalAmount: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summarySubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // Tarjeta genérica
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Acciones rápidas
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Producto
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIconInner: {
    width: 20,
    height: 28,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  productSold: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Alertas de stock
  alertCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  alertBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  alertLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  repoBtn: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  repoBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
