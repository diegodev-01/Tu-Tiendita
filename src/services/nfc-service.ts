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
            await NfcManager.requestTechnology(NfcTech.Ndef);

            const bytes = Ndef.encodeMessage([
                Ndef.textRecord(uniqueId),
            ])

            if (bytes) {
                await NfcManager.ndefHandler.writeNdefMessage(bytes);
                result = true;
            }
        } catch (error) {
            console.error('Error writing NFC data:', error);

        } finally {
            await NfcManager.cancelTechnologyRequest();
        }

        return result;
    }
}