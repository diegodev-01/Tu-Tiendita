import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS } from '@/src/styles/colors';

interface SuggestionCardProps {
  name: string;
  shelf: string;
  actual: number;
  min: number;
  suggested: number;
  status: string;
  statusColor: string;
}

const SuggestionCard = ({
  name,
  shelf,
  actual,
  min,
  suggested,
  status,
  statusColor,
}: SuggestionCardProps) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[styles.thumb, { backgroundColor: COLORS.primaryLight }]} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: '600', color: COLORS.text }}>{name}</Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{shelf}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: COLORS.primaryLight,
              alignSelf: 'flex-start',
              marginTop: 4,
            },
          ]}
        >
          <Text
            style={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}
          >
            {status}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <AntDesign name="plus" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
    <View style={styles.statsRow}>
      <View>
        <Text style={styles.statLabel}>Actual</Text>
        <Text style={styles.statVal}>{actual}</Text>
      </View>
      <View>
        <Text style={styles.statLabel}>Mínimo</Text>
        <Text style={styles.statVal}>{min}</Text>
      </View>
      <View>
        <Text style={[styles.statLabel, { color: COLORS.primary }]}>
          Sugerido
        </Text>
        <Text style={[styles.statVal, { color: COLORS.primary }]}>
          {suggested}
        </Text>
      </View>
    </View>
  </View>
);

export default function StockScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AntDesign name="arrow-left" size={24} color={COLORS.text} />
        <Text style={styles.title}>Surtir Stock</Text>
        <AntDesign name="clock-circle" size={20} color={COLORS.text} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>
          Sugerencias de Pedido{' '}
          <Text style={{ color: COLORS.textMuted, fontWeight: '400' }}>
            12 items críticos
          </Text>
        </Text>

        <SuggestionCard
          name="Galletas Oreo 114g"
          shelf="Gaveta C3"
          actual={0}
          min={5}
          suggested={20}
          status="Agotado"
          statusColor={COLORS.primary}
        />
        <SuggestionCard
          name="Sabritas Sal 40g"
          shelf="Gaveta B1"
          actual={3}
          min={10}
          suggested={25}
          status="Crítico"
          statusColor="#F5A623"
        />
        <SuggestionCard
          name="Coca Cola 600ml"
          shelf="Refrigerador 1"
          actual={8}
          min={12}
          suggested={48}
          status="Bajo"
          statusColor="#F5A623"
        />

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Órdenes en Tránsito
        </Text>
        <View style={[styles.card, { padding: 15 }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: COLORS.primaryLight,
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <AntDesign name="truck" size={16} color={COLORS.primary} />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>ORD-2891</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                  Proveedor: Bimbo
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: COLORS.primaryLight,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                En camino
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 15,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.statLabel}>Items</Text>
              <Text style={{ fontWeight: 'bold' }}>5 productos</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.statLabel}>Llegada est.</Text>
              <Text style={{ fontWeight: 'bold' }}>Hoy, 14:30</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.fullButton}>
            <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>
              Revisar Recepción
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.white,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  card: {
    backgroundColor: COLORS.cardBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumb: { width: 45, height: 45, borderRadius: 8 },
  addButton: {
    padding: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },
  statVal: { fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  fullButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
