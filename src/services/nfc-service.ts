import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

export const nfcService = {
  init: async () => {
    const isSupported = await NfcManager.isSupported();
    if (!isSupported) throw new Error('NFC no soportado en este dispositivo');

    await NfcManager.start();
  },

  writeProductId: async (uniqueId: string) => {
    let result = false;

    try {
      await NfcManager.requestTechnology([
        NfcTech.Ndef,
        NfcTech.NdefFormatable,
      ]);

      const tag = await NfcManager.getTag();
      console.log('Tecnologías detectadas:', tag?.techTypes);

      const bytes = Ndef.encodeMessage([Ndef.textRecord(uniqueId)]);

      const hasNdef = tag?.techTypes?.some(
        (type) => type.includes('Ndef') && !type.includes('NdefFormatable'),
      );
      const hasNdefFormatable = tag?.techTypes?.some((type) =>
        type.includes('NdefFormatable'),
      );

      if (hasNdef) {
        console.log('Escribiendo en modo NDEF directo...');
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        result = true;
      } else if (hasNdefFormatable) {
        console.log('Formateando y escribiendo en modo NdefFormatable...');
        await NfcManager.ndefFormatableHandlerAndroid.formatNdef(bytes);
        result = true;
      } else {
        console.warn(
          'El tag no parece ser compatible con escritura NDEF estándar.',
        );
      }
    } catch (error) {
      console.warn('Error durante la escritura:', error);
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }

    console.log('resultado:', result);
    return result;
  },
};
