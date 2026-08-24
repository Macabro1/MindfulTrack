import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { HabitList } from '../../components/HabitList';
import { Button } from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';

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
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DashboardScreen() {
  const theme = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // ==========================================
  // 1. CARGAR HÁBITOS
  // ==========================================
  const fetchHabits = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch(`${API_URL}/api/habits`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // ✅ CAMBIA ESTA LÍNEA PARA PROBAR ESTADOS:
        // - Estado normal:    setHabits(data.data || []);
        // - Estado vacío:     setHabits([]);
        // - Estado error:     setError('Error de prueba');
        setHabits(data.data || []);
      } else {
        setError(data.message || 'Error al cargar hábitos');
        setHabits([]);
      }
    } catch (err) {
      console.error('❌ Error al cargar hábitos:', err);
      setError('No se pudieron cargar los hábitos');
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. EFECTO INICIAL
  // ==========================================
  useEffect(() => {
    fetchHabits();
  }, []);

  // ==========================================
  // 3. FUNCIONES DE INTERACCIÓN
  // ==========================================
  const handleHabitPress = (habit: Habit) => {
    console.log('📱 Hábito presionado:', habit.nombre);
  };

  const handleToggleComplete = (habit: Habit) => {
    const updated = { ...habit, completado: !habit.completado };
    setHabits(habits.map(h => h.id === habit.id ? updated : h));
  };

  const handleRetry = () => {
    fetchHabits();
  };

  const handleAddHabit = () => {
    console.log('➕ Crear nuevo hábito');
  };

  // ==========================================
  // 4. RENDER
  // ==========================================
  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.semantic.text.primary }]}>
          🧘 MindfulTrack
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}>
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

      <Button
        variant="primary"
        fullWidth
        onPress={handleAddHabit}
      >
        + Nuevo Hábito
      </Button>
    </ScreenContainer>
  );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
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