import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import * as Network from 'expo-network';
import { ScreenContainer } from '../../components/ScreenContainer';
import { HabitList } from '../../components/HabitList';
import { Button } from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import DatabaseService from '../../services/database';
import SyncService from '../../services/syncService';

// ============================================
// CONFIGURACIÓN
// ============================================
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================
// TIPOS
// ============================================
interface Habit {
  id: number;
  nombre: string;
  descripcion?: string;
  objetivo_diario: number;
  completado: boolean;
  sync_status?: 'synced' | 'pending' | 'failed';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // ==========================================
  // 1. VERIFICAR CONEXIÓN
  // ==========================================
  const checkConnection = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_URL}/api/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const connected = response.ok;
      setIsConnected(connected);
      return connected;
    } catch {
      setIsConnected(false);
      return false;
    }
  };

  // ==========================================
  // 2. CARGAR HÁBITOS LOCALES (SQLite)
  // ==========================================
  const loadLocalHabits = async () => {
    try {
      const localHabits = await DatabaseService.getHabits();
      console.log('📱 Hábitos locales:', localHabits.length);

      const mappedHabits: Habit[] = localHabits.map((h: any) => ({
        id: h.id,
        nombre: h.name,
        descripcion: h.description || '',
        objetivo_diario: h.objetivo_diario || 1,
        completado: false,
        sync_status: h.sync_status || 'synced',
      }));

      setHabits(mappedHabits);

      const pending = mappedHabits.filter(
        (h) => h.sync_status === 'pending'
      ).length;
      setPendingCount(pending);

      return mappedHabits;
    } catch (dbError) {
      console.error('❌ Error al cargar hábitos locales:', dbError);
      return [];
    }
  };

  // ==========================================
  // 3. PROCESAR COLA DE SINCRONIZACIÓN
  // ==========================================
  const processQueue = async () => {
    try {
      console.log('🔄 Procesando cola de sincronización...');
      await SyncService.syncPendingQueue();
      console.log('✅ Cola procesada');

      const pending = await DatabaseService.getPendingQueue();
      setPendingCount(pending.length);
    } catch (syncError) {
      console.error('❌ Error al procesar cola:', syncError);
    }
  };

  // ==========================================
  // 4. CARGAR HÁBITOS (remoto + local)
  // ==========================================
  const fetchHabits = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const connected = await checkConnection();

      if (!connected) {
        console.log('📴 Sin conexión, cargando hábitos locales...');
        setError('Sin conexión. Mostrando datos locales.');
        await loadLocalHabits();
        setLoading(false);
        return;
      }

      // Procesar cola antes de cargar
      await processQueue();

      const response = await fetch(`${API_URL}/api/habits`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const remoteHabits = data.data || [];

        for (const habit of remoteHabits) {
          try {
            await DatabaseService.saveHabit({
              id: habit.id.toString(),
              name: habit.nombre,
              description: habit.descripcion || '',
              objetivo_diario: habit.objetivo_diario,
              created_at: Date.now(),
              updated_at: Date.now(),
              sync_status: 'synced',
            });
          } catch (dbError) {
            console.log('Error al guardar hábito local:', dbError);
          }
        }

        setHabits(remoteHabits);
        setLastSync(new Date());
        setIsConnected(true);

        const pending = remoteHabits.filter(
          (h: Habit) => h.sync_status === 'pending'
        ).length;
        setPendingCount(pending);
      } else {
        setError(data.message || 'Error al cargar hábitos');
        await loadLocalHabits();
      }
    } catch (err) {
      console.error('❌ Error al cargar hábitos:', err);
      setError('No se pudieron cargar los hábitos');
      await loadLocalHabits();
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 5. EFECTO INICIAL (CON RESET DE ITEMS FALLIDOS)
  // ==========================================
  useEffect(() => {
    const init = async () => {
      console.log('🚀 Iniciando app...');

      // Resetear items fallidos a pending
      await DatabaseService.resetFailedItems();

      // Luego cargar hábitos
      fetchHabits();
    };

    init();
  }, []);

  // ==========================================
  // 6. LISTENER DE CAMBIO DE RED
  // ==========================================
  useEffect(() => {
    const subscription = Network.addNetworkStateListener(async (state) => {
      console.log('🌐 Estado de red:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      if (state.isConnected === false) {
        console.log('📴 Sin conexión de red');
        setIsConnected(false);
        setError('Sin conexión. Mostrando datos locales.');
        await loadLocalHabits();
      } else {
        console.log('🔍 Verificando conexión con el backend...');
        const backendReachable = await checkConnection();

        if (backendReachable) {
          console.log('🟢 Backend alcanzable');
          setError(undefined);
          setIsConnected(true);

          await processQueue();
          await fetchHabits();
        } else {
          console.log('⚠️ Backend no alcanzable');
          setIsConnected(false);
          setError('Sin conexión. Mostrando datos locales.');
          await loadLocalHabits();
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // ==========================================
  // 7. FUNCIONES DE INTERACCIÓN
  // ==========================================
  const handleHabitPress = (habit: Habit) => {
    console.log('📱 Hábito presionado:', habit.nombre);
  };

  const handleToggleComplete = (habit: Habit) => {
    const updated = { ...habit, completado: !habit.completado };
    setHabits(habits.map((h) => (h.id === habit.id ? updated : h)));
  };

  const handleRetry = () => {
    fetchHabits();
  };

  const handleAddHabit = () => {
    router.push('/(tabs)/create');
  };

  // ==========================================
  // 8. UTILIDAD: TIEMPO DESDE ÚLTIMA SYNC
  // ==========================================
  const getTimeSinceSync = (): string => {
    if (!lastSync) return 'Nunca sincronizado';
    const diff = Date.now() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'hace un momento';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours} h`;
  };

  // ==========================================
  // 9. RENDER
  // ==========================================
  return (
    <ScreenContainer scrollable={true}>
      <View
        style={[
          styles.statusBar,
          {
            backgroundColor: isConnected ? '#E8F5E9' : '#FFEBEE',
            borderBottomColor: isConnected ? '#4CAF50' : '#F44336',
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: isConnected ? '#2E7D32' : '#C62828' },
          ]}
        >
          {isConnected ? '🟢 Conectado' : '🔴 Sin conexión'}
        </Text>

        {!isConnected && lastSync && (
          <Text style={[styles.ageText, { color: '#C62828' }]}>
            📊 {getTimeSinceSync()}
          </Text>
        )}

        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>
              ⏳ {pendingCount} pendiente(s)
            </Text>
          </View>
        )}
      </View>

      <View style={styles.header}>
        <Text
          style={[styles.title, { color: theme.colors.semantic.text.primary }]}
        >
          🧘 MindfulTrack
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}
        >
          Tus hábitos diarios
        </Text>
      </View>

      <HabitList
        habits={habits}
        loading={loading}
        error={error}
        onHabitPress={handleHabitPress}
        onToggleComplete={handleToggleComplete}
        onRetry={handleRetry}
      />

      <Button variant="primary" fullWidth onPress={handleAddHabit}>
        + Nuevo Hábito
      </Button>
    </ScreenContainer>
  );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    marginBottom: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pendingText: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
});