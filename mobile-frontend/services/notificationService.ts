import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking, Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Las notificaciones requieren un dispositivo físico');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habits', {
        name: 'Recordatorios de hábitos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    return true;
  }

  async scheduleHabitReminder(
    habitId: number,
    habitName: string,
    hour: number = 9,
    minute: number = 0
  ): Promise<string> {
    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      Alert.alert(
        'Permiso denegado',
        'Para activar recordatorios, habilita las notificaciones en los ajustes del sistema.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
        ]
      );
      throw new Error('Permiso de notificaciones no concedido');
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Recordatorio: ${habitName}`,
        body: '¡No olvides completar tu hábito de hoy!',
        data: { habitId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return identifier;
  }

  async cancelHabitReminder(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async sendTestNotification(habitName: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permiso no concedido');
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${habitName}`,
        body: 'Esta es una notificación de prueba',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  }
}

export default new NotificationService();