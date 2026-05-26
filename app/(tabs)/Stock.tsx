import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ButtonComponent from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  ProductResponse,
  productService,
} from '@/src/services/product-service';
import { COLORS } from '@/src/styles/colors';

const LOW_STOCK_THRESHOLD = 5;

function getStatus(stock: number): { label: string; color: string } {
  if (stock === 0) return { label: 'Agotado', color: COLORS.primary };
  if (stock <= 2) return { label: 'Crítico', color: '#F5A623' };
  return { label: 'Bajo', color: '#F5A623' };
}

interface SuggestionCardProps {
  product: ProductResponse;
  onAddPress: () => void;
}

const SuggestionCard = ({ product, onAddPress }: SuggestionCardProps) => {
  const { label, color } = getStatus(product.stock);
  const suggested = Math.max(product.minStock * 2, LOW_STOCK_THRESHOLD * 2);

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={[styles.thumb, { backgroundColor: COLORS.primaryLight }]}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontWeight: '600', color: COLORS.text }}>
            {product.name}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {product.shelf || 'Sin pasillo asignado'}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: COLORS.primaryLight,
                alignSelf: 'flex-start',
                marginTop: 4,
              },
            ]}
          >
            <Text style={{ color, fontSize: 10, fontWeight: 'bold' }}>
              {label}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <AntDesign name="plus" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Actual</Text>
          <Text style={styles.statVal}>{product.stock}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Mínimo</Text>
          <Text style={styles.statVal}>{product.minStock}</Text>
        </View>
        <View>
          <Text style={[styles.statLabel, { color: COLORS.primary }]}>
            Sugerido
          </Text>
          <Text style={[styles.statVal, { color: COLORS.primary }]}>
            {suggested}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function StockScreen() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchLowStock = async () => {
        try {
          setLoading(true);
          const products = await productService.getProducts();
          const lowStock = products.filter(
            (p) => p.stock === 0 || p.stock < LOW_STOCK_THRESHOLD,
          );
          setSuggestions(lowStock);
        } catch (error) {
          console.error('Error al cargar productos con bajo stock:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLowStock();
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Sugerencias de Pedido</Text>
          <ButtonComponent
            title="Nuevo Producto"
            onPress={() =>
              router.push({
                pathname: '/register-products',
                params: { mode: 'register' },
              })
            }
          />
        </View>

        {loading ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginVertical: 20 }}
          />
        ) : suggestions.length === 0 ? (
          <View style={styles.emptyBox}>
            <IconSymbol
              name="checkmark.circle"
              size={32}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>
              ¡Todo en orden! No hay productos con bajo stock.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ maxHeight: 380 }}
            contentContainerStyle={{ paddingBottom: 10 }}
            nestedScrollEnabled
          >
            {suggestions.map((product) => (
              <SuggestionCard
                key={product._id}
                product={product}
                onAddPress={() =>
                  router.push({
                    pathname: '/register-products',
                    params: { mode: 'refill', sku: product.sku },
                  })
                }
              />
            ))}
          </ScrollView>
        )}

        {/* ── Órdenes en Tránsito ── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Órdenes en Tránsito
        </Text>
        <View style={styles.emptyBox}>
          <AntDesign name="inbox" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>
            No hay órdenes en tránsito por el momento.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingBottom: 50 },
  card: {
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    width: '100%',
    borderColor: COLORS.border,
  },
  thumb: { width: 45, height: 45, borderRadius: 8 },
  addButton: {
    padding: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },
  statVal: { fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
