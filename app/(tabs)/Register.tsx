import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
// import { Fonts } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PulseRing from '@/components/ui/pulse-ring';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductTag {
  id: string;
  name: string;
  price: string;
  stock: string;
}

const mockCart = [
  { id: '1', name: 'Coca Cola 600ml', sku: '7501055300075', price: 20.0 },
  { id: '2', name: 'Sabritas Sal', sku: '7501011110001', price: 15.0 },
  { id: '3', name: 'Chocolates KitKat', sku: '7501022220002', price: 21.96 },
];

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [isWriting, setIsWriting] = useState(false);
  // const [history, setHistory] = useState<any[]>([]);
  // const [history, setHistory] = useState<ProductTag[]>([]);

  const subtotal = mockCart
    .reduce((sum, item) => sum + item.price, 0)
    .toFixed(2);
  const tax = (parseFloat(subtotal) * 0.16).toFixed(2);
  const total = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);

  return (
    <ThemedView style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.nfcContainer}>
          <View style={styles.nfcWaveWrapper}>
            <PulseRing delay={0} />
            <PulseRing delay={800} />
            <PulseRing delay={1600} />
            <View style={styles.nfcCircleInner}>
              <IconSymbol size={48} name="cart" color="white" />
            </View>
          </View>
          <ThemedText style={styles.nfcTitle} type="subtitle">
            Acerca el producto
          </ThemedText>
          <ThemedText style={styles.nfcSubtitle}>
            Pasa la tarjeta NFC del producto por el lector para agregarlo al
            carrito.
          </ThemedText>
        </View>

        <View style={styles.searchBar}>
          <IconSymbol size={20} name="magnifyingglass" color="#aaa" />
          <TextInput
            placeholder="Buscar por SKU o nombre..."
            style={styles.searchInput}
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <ThemedText style={styles.cartTitle} type="subtitle">
              CARRITO DE COMPRA
            </ThemedText>
            <View style={styles.itemsPill}>
              <ThemedText style={styles.itemsPillText}>
                {mockCart.length} ítems
              </ThemedText>
            </View>
          </View>

          {mockCart.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productIcon}>
                <IconSymbol size={24} name="cube.box.fill" color="#555" />
              </View>
              <View style={styles.productDetails}>
                <ThemedText style={styles.productName}>{item.name}</ThemedText>
                <ThemedText style={styles.productSku}>
                  SKU: {item.sku}
                </ThemedText>
              </View>
            </View>
          ))}
          <View style={{ height: 180 }} />
        </View>
      </ScrollView>

      <View style={[styles.floatingCart, { paddingBottom: insets.bottom }]}>
        <View style={styles.cartRows}>
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Subtotal</ThemedText>
            <ThemedText style={styles.priceValue}>${subtotal}</ThemedText>
          </View>
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>IVA (16%)</ThemedText>
            <ThemedText style={styles.priceValue}>${tax}</ThemedText>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <ThemedText style={styles.totalLabel}>Total a Pagar</ThemedText>
            <ThemedText style={styles.totalValue}>${total}</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.paymentButton}
          // onPress={}
          disabled={isWriting}
        >
          <IconSymbol size={20} name="wallet.bifold.fill" color="white" />
          <ThemedText style={styles.paymentButtonText}>
            Proceder a Cobro
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
    zIndex: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#333',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Estilos NFC Anillo
  nfcContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  nfcWaveWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nfcCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#FAEBF7', // Rosa muy suave para el anillo exterior
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  nfcCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EC407A', // Rosa fuerte central
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  nfcTitle: {
    color: '#333',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  nfcSubtitle: {
    color: '#777',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 10,
  },
  // Estilos Buscador
  searchBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    color: '#333',
    fontSize: 15,
  },
  // Estilos Lista Carrito
  cartSection: {},
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cartTitle: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
  },
  itemsPill: {
    backgroundColor: '#F7E7F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsPillText: {
    color: '#EC407A',
    fontWeight: '700',
    fontSize: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    paddingHorizontal: 12,
  },
  productName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  productSku: {
    color: '#777',
    fontSize: 13,
    marginTop: 3,
  },
  // Estilos Carrito Flotante Inferior
  floatingCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cartRows: {
    gap: 8,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#777',
    fontSize: 14,
  },
  priceValue: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  paymentButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
