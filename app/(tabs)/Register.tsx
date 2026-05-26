import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
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
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'qr'>(
    'efectivo',
  );

  const [showQR, setShowQR] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleScanNFC = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      await nfcService.init();
      const tagId = await nfcService.readTagId();

      if (!tagId) {
        Alert.alert(
          'Sin lectura',
          'No se pudo leer el tag NFC. Intenta de nuevo.',
        );
        return;
      }

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

  // Incrementa o decrementa; elimina el item si llega a 0
  const changeQuantity = (nfcTagId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.nfcTagId === nfcTagId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  // Establece la cantidad directamente desde el campo de texto
  const setQuantityDirectly = (nfcTagId: string, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    if (num === 0) {
      handleRemoveItem(nfcTagId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.nfcTagId === nfcTagId ? { ...c, quantity: num } : c)),
    );
  };

  /**
   * Proceder a cobro:
   * - Efectivo → registra directamente la transacción y limpia el carrito.
   * - QR → muestra el modal con el QR; el registro se hace al confirmar pago.
   */
  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert(
        'Carrito vacío',
        'Agrega al menos un producto escaneando su etiqueta NFC.',
      );
      return;
    }

    if (paymentMethod === 'qr') {
      // Mostrar QR primero; la transacción se confirma con "Pago Recibido"
      setShowQR(true);
      return;
    }

    // Efectivo: registrar inmediatamente
    await registerTransaction();
  };

  const registerTransaction = async () => {
    setIsProcessing(true);
    try {
      const items = cart.map((c) => ({
        nfcTagId: c.nfcTagId,
        quantity: c.quantity,
      }));
      const result = await transactionService.createTransaction({
        items,
        paymentMethod,
      });
      setTransactionId(result.id);
      Alert.alert(
        '¡Venta registrada!',
        `Total cobrado: Bs${subtotal.toFixed(2)}\nID: ${result.id}`,
      );
      setCart([]);
      setShowQR(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || 'Ocurrió un error al procesar la venta.';
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
          <TouchableOpacity
            onPress={handleScanNFC}
            disabled={isScanning || isProcessing}
          >
            <View style={styles.nfcWaveWrapper}>
              {isScanning && (
                <>
                  <PulseRing delay={0} />
                  <PulseRing delay={800} />
                  <PulseRing delay={1600} />
                </>
              )}
              <View
                style={[
                  styles.nfcCircleInner,
                  isScanning && styles.nfcCircleActive,
                ]}
              >
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
            style={[
              styles.paymentOption,
              paymentMethod === 'efectivo' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('efectivo')}
          >
            <IconSymbol
              size={16}
              name="banknote"
              color={paymentMethod === 'efectivo' ? 'white' : '#777'}
            />
            <ThemedText
              style={[
                styles.paymentOptionText,
                paymentMethod === 'efectivo' && styles.paymentOptionTextActive,
              ]}
            >
              Efectivo
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'qr' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('qr')}
          >
            <IconSymbol
              size={16}
              name="qrcode"
              color={paymentMethod === 'qr' ? 'white' : '#777'}
            />
            <ThemedText
              style={[
                styles.paymentOptionText,
                paymentMethod === 'qr' && styles.paymentOptionTextActive,
              ]}
            >
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
                El carrito está vacío.{'\n'}Escanea una etiqueta NFC para
                comenzar.
              </ThemedText>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.nfcTagId} style={styles.productCard}>
                {/* Ícono */}
                <View style={styles.productIcon}>
                  <IconSymbol size={22} name="cube.box.fill" color="#555" />
                </View>

                {/* Info */}
                <View style={styles.productDetails}>
                  <ThemedText style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.productSku}>
                    Bs{item.price.toFixed(2)} c/u
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.productSku,
                      { color: '#EC407A', fontWeight: '600' },
                    ]}
                  >
                    = Bs{(item.price * item.quantity).toFixed(2)}
                  </ThemedText>
                </View>

                {/* Controles de cantidad */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => changeQuantity(item.nfcTagId, -1)}
                  >
                    <ThemedText style={styles.qtyBtnText}>−</ThemedText>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.qtyInput}
                    keyboardType="numeric"
                    value={String(item.quantity)}
                    onChangeText={(v) => setQuantityDirectly(item.nfcTagId, v)}
                    selectTextOnFocus
                  />

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => changeQuantity(item.nfcTagId, 1)}
                  >
                    <ThemedText style={styles.qtyBtnText}>+</ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Quitar */}
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.nfcTagId)}
                  style={{ padding: 6, marginLeft: 4 }}
                >
                  <IconSymbol size={18} name="xmark.circle.fill" color="#ccc" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 200 }} />
        </View>
      </ScrollView>

      {/* ── Panel flotante de cobro ── */}
      <View
        style={[styles.floatingCart, { paddingBottom: insets.bottom + 30 }]}
      >
        <View style={styles.cartRows}>
          <View style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>
              Bs{subtotal.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.paymentButton,
            (isProcessing || cart.length === 0) && styles.paymentButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={isProcessing || cart.length === 0}
        >
          <IconSymbol size={20} name="wallet.bifold.fill" color="white" />
          <ThemedText style={styles.paymentButtonText}>
            {isProcessing
              ? 'Procesando...'
              : paymentMethod === 'qr'
                ? 'Generar QR de Cobro'
                : 'Completar Pago'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* ── Modal QR ── */}
      <Modal
        visible={showQR}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQR(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Cobro por QR
              </ThemedText>
              <ThemedText style={styles.modalAmount}>
                Bs{subtotal.toFixed(2)}
              </ThemedText>
            </View>

            {/* QR placeholder – reemplazar por QR real */}
            <Image
              source={{ uri: `https://picsum.photos/seed/${subtotal}/240/240` }}
              style={styles.qrImage}
              resizeMode="contain"
            />

            <ThemedText style={styles.qrHint}>
              Muestra este código QR al cliente para que realice el pago.
            </ThemedText>

            {/* Botón: añadir más productos sin cerrar todo */}
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() => setShowQR(false)}
            >
              <IconSymbol size={16} name="plus.circle" color="#EC407A" />
              <ThemedText style={styles.addMoreText}>
                Añadir más productos
              </ThemedText>
            </TouchableOpacity>

            {/* Botón: confirmar que el cliente pagó */}
            <TouchableOpacity
              style={[
                styles.paymentButton,
                isProcessing && styles.paymentButtonDisabled,
              ]}
              onPress={registerTransaction}
              disabled={isProcessing}
            >
              <IconSymbol
                size={20}
                name="checkmark.circle.fill"
                color="white"
              />
              <ThemedText style={styles.paymentButtonText}>
                {isProcessing ? 'Registrando...' : 'Pago Recibido – Confirmar'}
              </ThemedText>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowQR(false)}
            >
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FA', paddingBottom: 50 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // NFC
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
  nfcTitle: {
    color: '#333',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  nfcSubtitle: {
    color: '#777',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginHorizontal: 10,
  },

  // Método de pago
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

  // Carrito
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
  productDetails: { flex: 1, paddingHorizontal: 10 },
  productName: { fontWeight: '600', fontSize: 13, color: '#333' },
  productSku: { color: '#777', fontSize: 11, marginTop: 2 },
  removeBtn: { padding: 6 },

  // Controles de cantidad
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F7E7F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EC407A',
    lineHeight: 22,
  },
  qtyInput: {
    width: 38,
    // height: 32,
    borderWidth: 1.5,
    borderColor: '#EC407A',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  // Panel flotante
  floatingCart: {
    position: 'absolute',
    bottom: 60,
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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

  // Modal QR
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
    paddingBottom: 36,
    gap: 14,
  },
  modalHeader: { alignItems: 'center', gap: 4 },
  modalTitle: { fontWeight: '700', color: '#333' },
  modalAmount: { fontSize: 32, fontWeight: '800', color: '#EC407A' },
  qrImage: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#EC407A',
  },
  qrHint: {
    color: '#777',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginHorizontal: 16,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#EC407A',
    borderRadius: 10,
  },
  addMoreText: { color: '#EC407A', fontWeight: '600', fontSize: 14 },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { color: '#aaa', fontSize: 14 },
});
