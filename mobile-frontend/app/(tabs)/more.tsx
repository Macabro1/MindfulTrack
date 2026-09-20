import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/database';

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ habits: 0, logs: 0, pendingSync: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dbStats = await DatabaseService.getStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Error al cargar stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro? Se eliminarán todos los datos locales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🧘</Text>
        </View>
        <Text style={styles.userName}>
          {user?.nombre} {user?.apellido}
        </Text>
        <Text style={styles.userEmail}>{user?.correo}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Estadísticas Locales</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.habits}</Text>
            <Text style={styles.statLabel}>Hábitos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.logs}</Text>
            <Text style={styles.statLabel}>Registros</Text>
          </View>
          <View style={[styles.statCard, stats.pendingSync > 0 && styles.statPending]}>
            <Text style={[styles.statNumber, stats.pendingSync > 0 && styles.statNumberPending]}>
              {stats.pendingSync}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Información</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versión</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Usuario ID</Text>
          <Text style={styles.infoValue}>#{user?.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rol</Text>
          <Text style={styles.infoValue}>{user?.rol_id === 1 ? 'Admin' : 'Usuario'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>MindfulTrack © 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  profileCard: {
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 40 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: '#333' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statPending: { backgroundColor: '#FFF3E0' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50' },
  statNumberPending: { color: '#F57C00' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  logoutButton: {
    backgroundColor: '#F44336',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#999', fontSize: 12, paddingBottom: 32 },
});