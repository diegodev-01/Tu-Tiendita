import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

const ProductItem = ({ name, sku, stock, shelf, status }: ProductItemProps) => {
  const isOutOfStock = stock === 0;
  const badgeColor = isOutOfStock
    ? COLORS.red
    : stock < 10
      ? COLORS.amber
      : COLORS.green;
  const badgeBg = isOutOfStock
    ? COLORS.redLight
    : stock < 10
      ? COLORS.primaryLight
      : COLORS.greenLight;

  return (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productSkuShelf}>
          SKU: <Text style={{ fontWeight: '700' }}>{sku}</Text> •
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
          {stock} <Text style={{ fontSize: 12 }}>uds</Text>
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={{ color: badgeColor, fontSize: 12, fontWeight: '600' }}>
            {isOutOfStock ? 'Agotado' : stock < 10 ? 'Bajo' : 'Alto'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventario</Text>
        <TouchableOpacity style={styles.addButton}>
          <AntDesign name="plus" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <StatCard
            iconName="package-variant"
            label="Total Prod."
            value="428"
            color={COLORS.primary}
          />
          <StatCard
            iconName="alert-circle-outline"
            label="Bajo Stock"
            value="12"
            color={COLORS.amber}
          />
        </View>

        <View style={styles.searchContainer}>
          <AntDesign name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            placeholder="Buscar por nombre o SKU..."
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={[
            {
              name: 'Coca Cola Regular 600ml',
              sku: 'CC-600-R',
              stock: 45,
              shelf: 'Gaveta A2',
            },
            {
              name: 'Sabritas Sal 40g',
              sku: 'SAB-40-S',
              stock: 5,
              shelf: 'Gaveta B1',
            },
            {
              name: 'Galletas Oreo 114g',
              sku: 'OR-114',
              stock: 0,
              shelf: 'Gaveta C3',
            },
          ]}
          renderItem={({ item }) => <ProductItem {...item} />}
          keyExtractor={(item) => item.sku}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  addButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  content: { padding: 20 },
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
});
