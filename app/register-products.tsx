import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
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
import { api } from '@/src/services/api/api';
import { nfcService } from '@/src/services/nfc-service';
import { productService } from '@/src/services/product-service';

interface ProductTag {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  shelf: string;
  status: 'activo' | 'inactivo';
}

export default function RegisterOrRefillScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { mode = 'register', sku: initialSku = '' } = useLocalSearchParams<{
    mode: 'register' | 'refill';
    sku?: string;
  }>();
  const [isWriting, setIsWriting] = useState(false);

  const [name, setName] = useState('');
  const [sku, setSku] = useState(initialSku);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [shelf, setShelf] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);

  const [history, setHistory] = useState<ProductTag[]>([]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await api.get('/stores');
        if (response.data && response.data.length > 0) {
          setStoreId(response.data[0]._id); // Assuming the first store is the default
        }
      } catch (error) {
        console.error('Failed to fetch stores', error);
        Alert.alert('Error', 'No se pudo obtener la tienda del usuario.');
      }
    };

    fetchStore();
  }, []);

  const handleAction = async () => {
    if (mode === 'register' && (!name || !price || !stock)) {
      Alert.alert(
        'Campos incompletos',
        'Por favor llena los datos básicos del producto.',
      );
      return;
    }
    if (mode === 'refill' && !stock) {
      Alert.alert(
        'Campos incompletos',
        'Para surtir necesitas ingresar la cantidad a añadir.',
      );
      return;
    }

    if (mode === 'register' && !storeId) {
      Alert.alert(
        'Error de Tienda',
        'No se ha podido asignar una tienda al producto. Inténtalo de nuevo.',
      );
      return;
    }

    setIsWriting(true);

    try {
      await nfcService.init();
      console.log('Esperando tag NFC...');

      const tagId = await nfcService.readTagId();

      if (tagId) {
        if (mode === 'register') {
          const finalSku = tagId;
          console.log('SKU: ', finalSku);
          console.log('Name: ', name);
          console.log('Price: ', price);
          console.log('Stock: ', stock);
          console.log('Min Stock: ', minStock);
          console.log('Shelf: ', shelf);

          await productService.createProduct({
            name,
            storeId: storeId!,
            sku: finalSku,
            nfcTagId: tagId,
            price: parseFloat(price) || 0,
            stock: parseInt(stock, 10),
            minStock: parseInt(minStock, 10) || 0,
            shelf: shelf || 'Sin asignar',
            status: 'activo',
          });

          const finalProduct: ProductTag = {
            id: tagId,
            name,
            sku: finalSku,
            price: parseFloat(price) || 0,
            stock: parseInt(stock, 10),
            minStock: parseInt(minStock, 10) || 0,
            shelf: shelf || 'Sin asignar',
            status: 'activo',
          };

          setHistory((prev) => [finalProduct, ...prev]);
          Alert.alert(
            '¡Éxito!',
            `Producto "${name}" registrado con NFC ID: ${tagId}.`,
          );

          setName('');
          setSku('');
          setPrice('');
          setStock('');
          setShelf('');
        } else {
          const products = await productService.getProducts();
          const existingProduct = products.find(
            (p) => p.nfcTagId === tagId || (sku && p.sku === sku),
          );

          if (!existingProduct) {
            Alert.alert(
              'Producto no encontrado',
              'No se encontró un producto con este SKU en el servidor.',
            );
            return;
          }

          const addedStock = parseInt(stock, 10) || 0;
          await productService.updateProduct(existingProduct._id, {
            stock: existingProduct.stock + addedStock,
            nfcTagId: tagId,
          });

          const finalProduct: ProductTag = {
            id: existingProduct._id,
            name: existingProduct.name,
            sku,
            price: existingProduct.price,
            stock: addedStock,
            minStock: existingProduct.minStock,
            shelf: existingProduct.shelf,
            status: existingProduct.status as 'activo' | 'inactivo',
          };

          setHistory((prev) => [finalProduct, ...prev]);
          Alert.alert(
            '¡Éxito!',
            `Stock actualizado para el producto con NFC ID: ${tagId}`,
          );

          setSku('');
          setStock('');
        }
      } else {
        Alert.alert(
          'Error',
          'No se pudo leer el tag NFC. Intenta acercarlo nuevamente.',
        );
      }
    } catch (err) {
      Alert.alert(
        'Error de Inicialización',
        'Asegúrate de tener el NFC encendido de tu dispositivo.',
      );
      console.error(err);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <ThemedView style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.back()}
        >
          <IconSymbol size={24} name="arrow.left" color="#333" />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Gestión de Inventario
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nfcContainer}>
          <View style={styles.nfcWaveWrapper}>
            {isWriting && (
              <>
                <PulseRing delay={0} />
                <PulseRing delay={800} />
                <PulseRing delay={1600} />
              </>
            )}
            <View
              style={[
                styles.nfcCircleInner,
                isWriting && styles.nfcCircleInnerActive,
              ]}
            >
              <IconSymbol
                size={44}
                name={mode === 'register' ? 'plus' : 'box.truck'}
                color="white"
              />
            </View>
          </View>
          <ThemedText style={styles.nfcTitle} type="subtitle">
            {isWriting ? 'Buscando etiqueta NFC...' : 'Formulario Listo'}
          </ThemedText>
          <ThemedText style={styles.nfcSubtitle}>
            {isWriting
              ? 'Mantén el tag o tarjeta NFC cerca de la parte trasera del teléfono.'
              : 'Llena los datos y presiona el botón para leer y vincular el Tag.'}
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <ThemedText style={styles.formSectionTitle}>
            {mode === 'register'
              ? 'DATOS DEL NUEVO PRODUCTO'
              : 'INGRESAR STOCK'}
          </ThemedText>

          {mode === 'register' && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                Nombre del Producto *
              </ThemedText>
              <TextInput
                placeholder="Ej. Coca Cola 600ml"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#aaa"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Código SKU / Barras (Opcional)
            </ThemedText>
            <TextInput
              placeholder="Se leerá del NFC automáticamente"
              value={sku}
              onChangeText={setSku}
              style={styles.input}
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.rowInputs}>
            {mode === 'register' && (
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>Precio ($) *</ThemedText>
                <TextInput
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </View>
            )}
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText style={styles.inputLabel}>
                {mode === 'register'
                  ? 'Stock Inicial *'
                  : 'Cantidad a Añadir *'}
              </ThemedText>
              <TextInput
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                style={styles.input}
                placeholderTextColor="#aaa"
                keyboardType="numeric"
              />
            </View>
          </View>

          {mode === 'register' && (
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>Stock Mínimo</ThemedText>
                <TextInput
                  placeholder="5"
                  value={minStock}
                  onChangeText={setMinStock}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={styles.inputLabel}>
                  Estante / Pasillo (Opcional)
                </ThemedText>
                <TextInput
                  placeholder="A-12"
                  value={shelf}
                  onChangeText={setShelf}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              isWriting && styles.actionButtonDisabled,
            ]}
            onPress={handleAction}
            disabled={isWriting}
          >
            <IconSymbol
              size={20}
              name="dot.radiowaves.left.and.right"
              color="white"
            />
            <ThemedText style={styles.actionButtonText}>
              {isWriting
                ? 'Leyendo... Acerque Tag'
                : mode === 'register'
                  ? 'Vincular y Leer Producto'
                  : 'Sumar al Inventario'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          <ThemedText type="subtitle" style={styles.historyTitle}>
            Procesados en esta sesión
          </ThemedText>
          {history.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              Ningún movimiento guardado en esta pantalla todavía.
            </ThemedText>
          ) : (
            history.map((item, index) => (
              <View key={item.id + index} style={styles.historyItem}>
                <View style={styles.historyIconBox}>
                  <IconSymbol size={20} name="cube.box" color="#EC407A" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.historyProductName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.historyProductSku}>
                    SKU: {item.sku}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText style={styles.historyProductStock}>
                    +{item.stock} u.
                  </ThemedText>
                  <ThemedText style={styles.historyProductShelf}>
                    Loc: {item.shelf}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    paddingTop: 12,
  },
  // Selector superior de Modos
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#E9ECEF',
    padding: 4,
    borderRadius: 12,
    marginVertical: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#EC407A', // Match con el color de tu app
  },
  modeButtonText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 14,
  },
  modeButtonTextActive: {
    color: 'white',
  },
  // Animación del Lector NFC
  nfcContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  nfcWaveWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  nfcCircleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#747D8C', // Gris neutral apagado por defecto
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  nfcCircleInnerActive: {
    backgroundColor: '#EC407A', // Cambia a rosa intenso al activar
  },
  nfcTitle: {
    color: '#2F3542',
    fontWeight: '700',
    marginTop: 5,
  },
  nfcSubtitle: {
    color: '#747D8C',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: 15,
    marginTop: 4,
  },
  // Formulario
  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#747D8C',
    letterSpacing: 1,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F3542',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    color: '#000',
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  // Botones de ejecución
  actionButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2196F3', // Azul para destacar la acción de base de datos
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  actionButtonDisabled: {
    backgroundColor: '#A4B0BE',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  // Historial inferior
  historyContainer: {
    marginTop: 25,
  },
  historyTitle: {
    color: '#2F3542',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
  historyIconBox: {
    width: 38,
    height: 38,
    backgroundColor: '#FFF0F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyProductName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2F3542',
  },
  historyProductSku: {
    fontSize: 12,
    color: '#747D8C',
    marginTop: 2,
  },
  historyProductStock: {
    fontWeight: '700',
    color: '#2ED573',
    fontSize: 14,
  },
  historyProductShelf: {
    fontSize: 11,
    color: '#A4B0BE',
    marginTop: 2,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    color: '#A4B0BE',
    fontSize: 13,
  },
});
