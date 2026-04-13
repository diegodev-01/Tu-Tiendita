jest.mock('react-native-nfc-manager', () => ({
  start: jest.fn(),
  isSupported: jest.fn().mockResolvedValue(true),
  setEventListener: jest.fn(),
  registerTagEvent: jest.fn(),
}));
