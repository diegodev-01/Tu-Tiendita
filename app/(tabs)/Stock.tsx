import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const StockScreen = () => {
  return (
    <View style={styles.container}>
      <Text>StockScreen</Text>
    </View>
  );
};

export default StockScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
