import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ReportsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>ReportsScreen</Text>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
