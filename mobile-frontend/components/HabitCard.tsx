import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Habit {
  id: number;
  nombre: string;
  descripcion?: string;
  objetivo_diario: number;
  completado: boolean;
}

interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  onToggleComplete?: () => void;
  showProgress?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onPress,
  onToggleComplete,
  showProgress = true,
}) => {
  const theme = useTheme();
  const progress = habit.completado ? 100 : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.primitive.white,
          borderColor: habit.completado ? theme.colors.semantic.success : theme.colors.semantic.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.semantic.text.primary, textDecorationLine: habit.completado ? 'line-through' : 'none' }]}>
          {habit.nombre}
        </Text>
        {onToggleComplete && (
          <Switch
            value={habit.completado}
            onValueChange={onToggleComplete}
            trackColor={{ false: theme.colors.primitive.gray[300], true: theme.colors.semantic.primary.main }}
          />
        )}
      </View>

      {habit.descripcion && (
        <Text style={[styles.description, { color: theme.colors.semantic.text.secondary }]}>
          {habit.descripcion}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={[styles.goal, { color: theme.colors.semantic.text.hint }]}>
          🎯 Objetivo: {habit.objetivo_diario} min
        </Text>

        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.primitive.gray[100] }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: habit.completado ? theme.colors.semantic.success : theme.colors.semantic.primary.main,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.semantic.text.secondary }]}>
              {progress}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', flex: 1, marginRight: 8 },
  description: { fontSize: 14, marginTop: 4, marginBottom: 8 },
  footer: { marginTop: 8 },
  goal: { fontSize: 12, marginBottom: 8 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, marginLeft: 8, width: 40, textAlign: 'right' },
});