import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ProductResponse,
  productService,
} from '@/src/services/product-service';
import { COLORS } from '@/src/styles/colors';

interface StatCardProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  color: string;
}

const StatCard = ({ iconName, label, value, color }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statCardHeader}>
      <MaterialCommunityIcons name={iconName} size={24} color={color} />
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
    <Text style={styles.statCardValue}>{value}</Text>
  </View>
);

interface ProductItemProps {
  name: string;
  sku: string;
  stock: number;
  shelf: string;
  status?: 'high' | 'low' | 'out';
}

const ProductItem = ({ name, sku, stock, shelf }: ProductItemProps) => {
  const stockValue = stock ?? 0;
  const isOutOfStock = stockValue === 0;
  const badgeColor = isOutOfStock
    ? COLORS.red
    : stockValue < 10
      ? COLORS.amber
      : COLORS.green;
  const badgeBg = isOutOfStock
    ? COLORS.redLight
    : stockValue < 10
      ? COLORS.primaryLight
      : COLORS.greenLight;

  return (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productSkuShelf}>
          SKU: <Text style={{ fontWeight: '700' }}>{sku}</Text> •{' '}
          <MaterialCommunityIcons name="inbox" size={12} /> {shelf}
        </Text>
      </View>
      <View style={styles.productFooter}>
        <Text
          style={[
            styles.stockValue,
            { color: isOutOfStock ? COLORS.red : COLORS.text },
          ]}
        >
          {stockValue} <Text style={{ fontSize: 12 }}>uds</Text>
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={{ color: badgeColor, fontSize: 12, fontWeight: '600' }}>
            {isOutOfStock ? 'Agotado' : stockValue < 10 ? 'Bajo' : 'Alto'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function InventoryScreen() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>(
    [],
  );
  const [stats, setStats] = useState({ total: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);

      const total = fetchedProducts.length;
      const lowStock = fetchedProducts.filter(
        (p) => p.stock < p.minStock,
      ).length;
      setStats({ total, lowStock });
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [fetchInventory]),
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      const filteredData = products.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedQuery) ||
          item.sku.toLowerCase().includes(lowercasedQuery),
      );
      setFilteredProducts(filteredData);
    } else {
      setFilteredProducts(products);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <StatCard
          iconName="package-variant"
          label="Total Prod."
          value={stats.total.toString()}
          color={COLORS.primary}
        />
        <StatCard
          iconName="alert-circle-outline"
          label="Bajo Stock"
          value={stats.lowStock.toString()}
          color={COLORS.amber}
        />
      </View>

      <View style={styles.searchContainer}>
        <AntDesign name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          placeholder="Buscar por nombre o SKU..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductItem {...item} />}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron productos.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  addButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: COLORS.cardBg,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statCardLabel: { fontSize: 12, color: COLORS.textMuted, marginLeft: 5 },
  statCardValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { marginLeft: 10, flex: 1 },
  productCard: {
    backgroundColor: COLORS.cardBg,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  productSkuShelf: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  productFooter: { alignItems: 'flex-end' },
  stockValue: { fontSize: 18, fontWeight: 'bold' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 5,
  },
  productInfo: { flex: 1, paddingRight: 10 },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textMuted,
    fontSize: 16,
  },
});
