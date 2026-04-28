import { useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

import * as Crypto from 'expo-crypto';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { nfcService } from '@/src/services/nfc-service';


export default function TabTwoScreen() {
  const [isWriting, setIsWriting] = useState(false);

  const handleStartWriting = async () => {
    const newId = Crypto.randomUUID()

    setIsWriting(true);
    nfcService.init();
    Alert.alert("Modo Escritura", "Acerque el tag NFC al teléfono");

    const success = await nfcService.writeProductId(newId);

    setIsWriting(false);

    if (success) {
      Alert.alert("¡Éxito!", `ID del producto escrito: ${newId}`);
    } else {
      Alert.alert("Error", "No se pudo escribir en el tag NFC. Inténtalo de nuevo.");
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          NFC
        </ThemedText>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText>
              {isWriting ? "Esperando Tag..." : "Listo para grabar"}
            </ThemedText>
            <Button 
              title={isWriting ? "Cancelando..." : "Grabar ID en Tag"} 
              onPress={handleStartWriting} 
              disabled={isWriting}
            />
          </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  content: {
    padding: 16,
    borderRadius: 8,
  },
});
