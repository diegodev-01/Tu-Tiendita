import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import PulseRing from '@/components/ui/pulse-ring';
import { Colors } from '@/constants/theme';
import { nfcService } from '@/src/services/nfc-service';
import { transactionService } from '@/src/services/transaction-service';

interface CartItem {
  nfcTagId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'qr'>('efectivo');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleScanNFC = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      await nfcService.init();
      const tagId = await nfcService.readTagId();

      if (!tagId) {
        Alert.alert('Sin lectura', 'No se pudo leer el tag NFC. Intenta de nuevo.');
        return;
      }

      // Buscar el producto asociado a ese tag
      const product = await transactionService.getProductByNfcTag(tagId);

      if (!product) {
        Alert.alert(
          'Producto no encontrado',
          `No hay ningún producto vinculado al tag NFC: ${tagId}`,
        );
        return;
      }

      if (product.stock === 0) {
        Alert.alert(
          'Sin stock',
          `"${product.name}" está agotado y no puede agregarse al carrito.`,
        );
        return;
      }

      // Si ya existe en el carrito, incrementar cantidad
      setCart((prev) => {
        const existing = prev.find((c) => c.nfcTagId === tagId);
        if (existing) {
          return prev.map((c) =>
            c.nfcTagId === tagId ? { ...c, quantity: c.quantity + 1 } : c,
          );
        }
        return [
          ...prev,
          {
            nfcTagId: tagId,
            productId: product._id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            quantity: 1,
          },
        ];
      });
    } catch (err) {
      Alert.alert('Error NFC', 'Asegúrate de que el NFC esté activado.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveItem = (nfcTagId: string) => {
    setCart((prev) => prev.filter((c) => c.nfcTagId !== nfcTagId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega al menos un producto escaneando su etiqueta NFC.');
      return;
    }
    setIsProcessing(true);
    try {
      const items = cart.map((c) => ({ nfcTagId: c.nfcTagId, quantity: c.quantity }));
      await transactionService.createTransaction({ items, paymentMethod });

      Alert.alert('¡Venta registrada!', `Total cobrado: Bs${subtotal.toFixed(2)}`);
      setCart([]);
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Ocurrió un error al procesar la venta.';
      Alert.alert('Error al cobrar', message);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ThemedView style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Botón NFC central ── */}
        <View style={styles.nfcContainer}>
          <TouchableOpacity onPress={handleScanNFC} disabled={isScanning || isProcessing}>
            <View style={styles.nfcWaveWrapper}>
              {isScanning && (
                <>
                  <PulseRing delay={0} />
                  <PulseRing delay={800} />
                  <PulseRing delay={1600} />
                </>
              )}
              <View style={[styles.nfcCircleInner, isScanning && styles.nfcCircleActive]}>
                <IconSymbol size={48} name="cart" color="white" />
              </View>
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.nfcTitle} type="subtitle">
            {isScanning ? 'Leyendo etiqueta...' : 'Presiona para escanear'}
          </ThemedText>
          <ThemedText style={styles.nfcSubtitle}>
            {isScanning
              ? 'Acerca la tarjeta NFC del producto a la parte trasera del teléfono.'
              : 'Toca el botón y acerca el producto para agregarlo al carrito.'}
          </ThemedText>
        </View>

        {/* ── Selector método de pago ── */}
        <View style={styles.paymentSelector}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'efectivo' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('efectivo')}
          >
            <IconSymbol size={16} name="banknote" color={paymentMethod === 'efectivo' ? 'white' : '#777'} />
            <ThemedText style={[styles.paymentOptionText, paymentMethod === 'efectivo' && styles.paymentOptionTextActive]}>
              Efectivo
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'qr' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('qr')}
          >
            <IconSymbol size={16} name="qrcode" color={paymentMethod === 'qr' ? 'white' : '#777'} />
            <ThemedText style={[styles.paymentOptionText, paymentMethod === 'qr' && styles.paymentOptionTextActive]}>
              QR
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* ── Carrito ── */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <ThemedText style={styles.cartTitle} type="subtitle">
              CARRITO DE COMPRA
            </ThemedText>
            <View style={styles.itemsPill}>
              <ThemedText style={styles.itemsPillText}>
                {cart.reduce((s, c) => s + c.quantity, 0)} ítems
              </ThemedText>
            </View>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <IconSymbol size={40} name="cart" color="#ccc" />
              <ThemedText style={styles.emptyCartText}>
                El carrito está vacío.{'\n'}Escanea una etiqueta NFC para comenzar.
              </ThemedText>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.nfcTagId} style={styles.productCard}>
                <View style={styles.productIcon}>
                  <IconSymbol size={24} name="cube.box.fill" color="#555" />
                </View>
                <View style={styles.productDetails}>
                  <ThemedText style={styles.productName}>{item.name}</ThemedText>
                  <ThemedText style={styles.productSku}>SKU: {item.sku}</ThemedText>
                  <ThemedText style={styles.productSku}>
                    {item.quantity} × Bs{item.price.toFixed(2)} = Bs{(item.price * item.quantity).toFixed(2)}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(item.nfcTagId)} style={styles.removeBtn}>
                  <IconSymbol size={18} name="xmark.circle.fill" color="#ccc" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 220 }} />
        </View>
      </ScrollView>

      {/* ── Panel flotante de cobro ── */}
      <View style={[styles.floatingCart, { paddingBottom: insets.bottom }]}>
        <View style={styles.cartRows}>
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>Bs{subtotal.toFixed(2)}</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.paymentButton, (isProcessing || cart.length === 0) && styles.paymentButtonDisabled]}
          onPress={handleCheckout}
          disabled={isProcessing || cart.length === 0}
        >
          <IconSymbol size={20} name="wallet.bifold.fill" color="white" />
          <ThemedText style={styles.paymentButtonText}>
            {isProcessing ? 'Procesando...' : 'Proceder a Cobro'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FA', paddingBottom: 50 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  nfcContainer: {
    alignItems: 'center',
    marginTop: 12,
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
  nfcCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EC407A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  nfcCircleActive: { backgroundColor: '#c2185b' },
  nfcTitle: { color: '#333', fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  nfcSubtitle: { color: '#777', textAlign: 'center', fontSize: 13, lineHeight: 20, marginHorizontal: 10 },
  paymentSelector: {
    flexDirection: 'row',
    backgroundColor: '#E9ECEF',
    padding: 4,
    borderRadius: 12,
    marginVertical: 14,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paymentOptionActive: { backgroundColor: '#EC407A' },
  paymentOptionText: { color: '#495057', fontWeight: '600', fontSize: 14 },
  paymentOptionTextActive: { color: 'white' },
  cartSection: {},
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: { color: '#333', fontWeight: '700', fontSize: 16 },
  itemsPill: {
    backgroundColor: '#F7E7F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsPillText: { color: '#EC407A', fontWeight: '700', fontSize: 12 },
  emptyCart: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyCartText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
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
    width: 46,
    height: 46,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: { flex: 1, paddingHorizontal: 12 },
  productName: { fontWeight: '600', fontSize: 14, color: '#333' },
  productSku: { color: '#777', fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 6 },
  floatingCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cartRows: { marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { color: '#777', fontSize: 14 },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#000' },
  paymentButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  paymentButtonDisabled: { backgroundColor: '#A4B0BE' },
  paymentButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
