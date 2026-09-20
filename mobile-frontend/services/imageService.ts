import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

class ImageService {
  async pickImageFromLibrary(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
      return null;
    }
  }

  async takePhotoWithCamera(): Promise<string | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso de cámara denegado',
        'Necesitamos acceso a tu cámara para tomar fotos. Puedes habilitarlo en los ajustes del sistema.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Abrir Ajustes',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return null;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
      return null;
    }
  }

  async showImagePickerOptions(): Promise<string | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Seleccionar imagen',
        '¿De dónde quieres obtener la imagen?',
        [
          {
            text: 'Galería',
            onPress: async () => {
              const uri = await this.pickImageFromLibrary();
              resolve(uri);
            },
          },
          {
            text: 'Cámara',
            onPress: async () => {
              const uri = await this.takePhotoWithCamera();
              resolve(uri);
            },
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  }
}

export default new ImageService();