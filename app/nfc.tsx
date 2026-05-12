import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { nfcService } from '@/src/services/nfc-service';

interface ProductTag {
  id: string;
  name: string;
  price: string;
  stock: string;
}

export default function TabTwoScreen() {
  const [isWriting, setIsWriting] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [history, setHistory] = useState<ProductTag[]>([]);

  const handleStartWriting = async () => {
    if (!name || !price || !stock) {
      Alert.alert(
        'Campos incompletos',
        'Por favor llena todos los datos antes de grabar.',
      );
      return;
    }

    const newId = Crypto.randomUUID();

    const productData = { id: newId, name, price, stock };

    setIsWriting(true);
    try {
      await nfcService.init();
      console.log('Esperando tag...');

      const success = await nfcService.writeProductId(newId);

      if (success) {
        setHistory((prev) => [productData, ...prev]);
        Alert.alert('¡Éxito!', `Producto "${name}" grabado correctamente.`);
        setName('');
        setPrice('');
        setStock('');
      } else {
        Alert.alert('Error', 'No se pudo escribir en el tag NFC.');
      }
    } catch (err) {
      Alert.alert(
        'Error de Inicialización',
        'Asegúrate de tener el NFC encendido.',
      );
      console.error(err);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="tag"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Registrar Producto NFC</ThemedText>

        {/* Formulario de entrada */}
        <View style={styles.form}>
          <TextInput
            placeholder="Nombre del producto"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Precio ($)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Stock inicial"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#888"
          />

          <Button
            title={isWriting ? 'Aproxime el Tag...' : 'Grabar ID en Tag'}
            onPress={handleStartWriting}
            disabled={isWriting}
            color="#2196F3"
          />
        </View>

        <ThemedView style={styles.historyContainer}>
          <ThemedText type="subtitle">Historial de Grabación</ThemedText>
          {history.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              No hay productos grabados aún.
            </ThemedText>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.productName}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.productId}>
                    ID: {item.id.slice(0, 8)}...
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText style={styles.productPrice}>
                    ${item.price}
                  </ThemedText>
                  <ThemedText style={styles.productStock}>
                    Cant: {item.stock}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  form: {
    backgroundColor: 'rgba(128,128,128,0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  historyContainer: {
    marginTop: 10,
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginBottom: 8,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  productId: {
    fontSize: 12,
    opacity: 0.6,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productStock: {
    fontSize: 12,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.5,
  },
});
