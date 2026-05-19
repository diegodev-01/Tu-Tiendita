import { COLORS } from '@/src/styles/colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonComponentProps {
  title: string;
  onPress: () => void;
}

const ButtonComponent = ({ title, onPress }: ButtonComponentProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
