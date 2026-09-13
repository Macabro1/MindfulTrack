import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function CreateHabitScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [objetivoDiario, setObjetivoDiario] = useState('1');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleCreate = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!objetivoDiario || isNaN(Number(objetivoDiario))) {
      newErrors.objetivoDiario = 'El objetivo debe ser un número válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Error', 'Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          objetivo_diario: Number(objetivoDiario),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setErrors(data.errors);
          Alert.alert('Errores de validación', 'Revisa los campos marcados');
          return;
        }
        throw new Error(data.message || `Error HTTP ${response.status}`);
      }

      Alert.alert('Éxito', 'Hábito creado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('❌ Error al crear hábito:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el hábito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.semantic.text.primary }]}>
            ➕ Nuevo Hábito
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.semantic.text.secondary }]}>
            Crea un nuevo hábito para tu rutina diaria
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[styles.input, errors.nombre && styles.inputError]}
            value={nombre}
            onChangeText={(text) => {
              setNombre(text);
              if (errors.nombre) setErrors({ ...errors, nombre: '' });
            }}
            placeholder="Ej: Caminar 20 minutos"
            placeholderTextColor="#999"
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Describe tu hábito"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Objetivo diario *</Text>
          <TextInput
            style={[styles.input, errors.objetivoDiario && styles.inputError]}
            value={objetivoDiario}
            onChangeText={(text) => {
              setObjetivoDiario(text);
              if (errors.objetivoDiario) setErrors({ ...errors, objetivoDiario: '' });
            }}
            placeholder="Ej: 1"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          {errors.objetivoDiario && (
            <Text style={styles.errorText}>{errors.objetivoDiario}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '⏳ Creando...' : '✅ Crear Hábito'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 4, color: '#666' },
  form: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#333',
  },
  inputError: { borderColor: '#F44336', backgroundColor: '#FFEBEE' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { color: '#F44336', fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { backgroundColor: '#90CAF9' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cancelButton: { backgroundColor: '#EEE' },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
});