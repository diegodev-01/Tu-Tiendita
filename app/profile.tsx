import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/src/styles/colors';
import { type SFSymbols7_0 } from 'sf-symbols-typescript';

const USER_DATA = {
  name: 'Alejandro Gonzales',
  role: 'Administrador de Sucursal',
  email: 'a.gonzales@tienda.bo',
  phone: '+591 71234567',
  branch: 'Sucursal Central - Cochabamba',
  joinedDate: 'Miembro desde: Enero 2025',
};

function MenuOption({
  icon,
  title,
  subtitle,
  onPress,
  isDestructive = false,
}: {
  icon: SFSymbols7_0;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, isDestructive && styles.destructiveRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIconContainer,
          isDestructive && styles.destructiveIconContainer,
        ]}
      >
        <IconSymbol
          name={icon}
          size={20}
          color={isDestructive ? COLORS.red : COLORS.primary}
        />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={[styles.menuTitle, isDestructive && styles.destructiveText]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {!isDestructive && (
        <IconSymbol name="chevron.right" size={14} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );
}

// ── Pantalla de Perfil Principal ───────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Salir',
          style: 'destructive',
          onPress: () =>
            console.log('Log out presionado - Limpiar tokens aquí'),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.6}
        >
          <IconSymbol name="arrow.left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {USER_DATA.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Text>
          </View>

          <Text style={styles.userName}>{USER_DATA.name}</Text>
          <Text style={styles.userRole}>{USER_DATA.role}</Text>
          <Text style={styles.userJoined}>{USER_DATA.joinedDate}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>14</Text>
              <Text style={styles.statLabel}>Días Activo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Reg.</Text>
              <Text style={styles.statLabel}>Turno AM</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de la Cuenta</Text>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Correo Electrónico</Text>
            <Text style={styles.infoValue}>{USER_DATA.email}</Text>
          </View>

          <View style={styles.infoFieldDivider} />

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Teléfono de Contacto</Text>
            <Text style={styles.infoValue}>{USER_DATA.phone}</Text>
          </View>

          <View style={styles.infoFieldDivider} />

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Punto de Venta asignado</Text>
            <Text style={styles.infoValue}>{USER_DATA.branch}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ajustes y Soporte</Text>

          <MenuOption
            icon="person"
            title="Editar Mis Datos"
            subtitle="Actualizar contraseña o teléfono"
            onPress={() => console.log('Navegar a edición')}
          />

          {/**Funciones Futuras */}
          {/* <MenuOption
            icon="printer"
            title="Configurar Impresora"
            subtitle="Vincular terminal térmica Bluetooth"
            onPress={() => console.log('Navegar a impresoras')}
          />

          <MenuOption
            icon="questionmark.circle"
            title="Soporte Técnico"
            subtitle="Contactar con soporte de sistemas"
            onPress={() => console.log('Navegar a soporte')}
          /> */}
        </View>

        <View style={[styles.card, { padding: 8 }]}>
          <MenuOption
            icon="arrow.left.square.fill"
            title="Cerrar Sesión"
            onPress={handleLogout}
            isDestructive={true}
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  profileCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  userRole: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  userJoined: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 6,
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  infoField: {
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoFieldDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  destructiveRow: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  destructiveText: {
    color: COLORS.red,
    fontWeight: '700',
  },
});
