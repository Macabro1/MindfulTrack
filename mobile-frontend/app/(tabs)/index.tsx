import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function TabOneScreen() {
  const [status, setStatus] = useState('🔄 Conectando al backend...');

  useEffect(() => {
    // Intentar conectar con el backend
    fetch(`${API_URL}/api/health`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Respuesta del backend:', data);
        setStatus('✅ Conectado al backend');
      })
      .catch(err => {
        console.error('❌ Error de conexión:', err);
        setStatus('❌ No se pudo conectar al backend');
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧘 MindfulTrack</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.hint}>IP: {API_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  status: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});