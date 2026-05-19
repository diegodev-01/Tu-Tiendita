import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

export default function PulseRing({ delay }: { delay: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.ease),
        delay: delay,
        useNativeDriver: true,
      }).start(() => startAnimation());
    };

    startAnimation();
  }, [animatedValue, delay]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.5],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 0.4, 0.2, 0],
  });

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
    borderColor: '#EC407A',
    backgroundColor: '#FAEBF7',
  },
});
