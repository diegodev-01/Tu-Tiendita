import { COLORS } from '@/src/styles/colors';
import { formattedDate } from '@/src/utils/date';
import { useSegments } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './icon-symbol';

const Header = () => {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const currentTab = segments[1] || 'index';

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'index':
        return 'Mi Tiendita';
      case 'Inventory':
        return 'Inventario';
      case 'Register':
        return 'Nuevo Carrito';
      case 'Stock':
        return 'Surtir Stock';
      case 'Reports':
        return 'Reportes';
      default:
        return 'Mi Tiendita';
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerLeft}>
        <View style={styles.storeBadge}>
          <Text style={styles.storeBadgeText}>MT</Text>
        </View>
        <View>
          <Text style={styles.storeName}>{getHeaderTitle()}</Text>
          <Text style={styles.storeDate}>{formattedDate}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notifBtn}>
          <IconSymbol name="bell" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileBtn}>
          <IconSymbol name="person" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeBadgeText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  storeDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
