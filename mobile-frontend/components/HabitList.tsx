import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { HabitCard } from './HabitCard';
import { useTheme } from '../hooks/useTheme';

interface Habit {
  id: number;
  nombre: string;
  descripcion?: string;
  objetivo_diario: number;
  completado: boolean;
  sync_status?: 'synced' | 'pending' | 'failed';
}

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
  error?: string;
  onHabitPress: (habit: Habit) => void;
  onToggleComplete: (habit: Habit) => void;
  onRetry?: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  loading,
  error,
  onHabitPress,
  onToggleComplete,
  onRetry,
}) => {
  const theme = useTheme();

  // ============================================
  // 1. CARGANDO
  // ============================================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={theme.colors.semantic.primary.main}
        />
        <Text
          style={[styles.message, { color: theme.colors.semantic.text.secondary }]}
        >
          Cargando tus hábitos...
        </Text>
      </View>
    );
  }

  // ============================================
  // 2. ERROR (solo si NO hay hábitos locales)
  // ============================================
  if (error && habits.length === 0) {
    return (
      <View style={styles.center}>
        <Text
          style={[styles.errorText, { color: theme.colors.semantic.error }]}
        >
          ⚠️ {error}
        </Text>
        {onRetry && (
          <Text
            style={[
              styles.retry,
              { color: theme.colors.semantic.primary.main },
            ]}
            onPress={onRetry}
          >
            Intentar de nuevo
          </Text>
        )}
      </View>
    );
  }

  // ============================================
  // 3. SIN HÁBITOS
  // ============================================
  if (habits.length === 0) {
    return (
      <View style={styles.center}>
        <Text
          style={[styles.emptyIcon, { color: theme.colors.semantic.text.hint }]}
        >
          📋
        </Text>
        <Text
          style={[
            styles.emptyTitle,
            { color: theme.colors.semantic.text.primary },
          ]}
        >
          No tienes hábitos
        </Text>
        <Text
          style={[
            styles.emptyDescription,
            { color: theme.colors.semantic.text.secondary },
          ]}
        >
          Crea tu primer hábito para empezar a mejorar tu bienestar.
        </Text>
      </View>
    );
  }

  // ============================================
  // 4. LISTA DE HÁBITOS (con o sin error)
  // ============================================
  return (
    <View style={styles.listContainer}>
      {/* Mensaje de error arriba si hay hábitos locales */}
      {error && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ {error}</Text>
          {onRetry && (
            <Text style={styles.warningRetry} onPress={onRetry}>
              Reintentar
            </Text>
          )}
        </View>
      )}

      {/* Lista de hábitos */}
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onPress={() => onHabitPress(habit)}
          onToggleComplete={() => onToggleComplete(habit)}
          showProgress={true}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  listContainer: {
    flex: 1,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retry: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    flex: 1,
  },
  warningRetry: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '700',
    marginLeft: 8,
  },
});