import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import Header from '@/components/ui/header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        header: () => <Header />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          overflow: 'visible',
          backgroundColor: 'white',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Inventory"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cube.box" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Register"
        options={{
          title: '',
          tabBarButton: (props) => {
            const { delayLongPress, ...safeProps } = props;
            const cleanProps = Object.fromEntries(
              Object.entries(safeProps).filter(([, value]) => value !== null),
            );
            return (
              <TouchableOpacity
                {...cleanProps}
                disabled={safeProps.disabled ?? false}
                style={styles.tabButton}
              >
                <IconSymbol size={32} name="plus" color="white" />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tabs.Screen
        name="Stock"
        options={{
          title: 'Surtir',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="box.truck.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    marginTop: -25,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    alignSelf: 'center',
  },
  floatingButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
