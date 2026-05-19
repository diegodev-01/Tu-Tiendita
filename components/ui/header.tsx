import { COLORS } from '@/src/styles/colors';
import { formattedDate } from '@/src/utils/date';
import React from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconSymbol } from './icon-symbol';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.storeBadge}>
          <Text style={styles.storeBadgeText}>MT</Text>
        </View>
        <View>
          <Text style={styles.storeName}>Mi Tiendita</Text>
          <Text style={styles.storeDate}>{formattedDate}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notifBtn}>
        <IconSymbol name="bell" size={20} color={COLORS.text} />
      </TouchableOpacity>
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
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
});
