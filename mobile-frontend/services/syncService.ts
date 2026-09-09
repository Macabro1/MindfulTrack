import DatabaseService from './database';
import SecureStorageService from './secureStorage';
import api from './api';

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async startAutoSync(): Promise<void> {
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await this.syncPendingQueue();
      }
    }, 30000);

    window.addEventListener('online', async () => {
      console.log('📶 Conexión restablecida, sincronizando...');
      await this.syncPendingQueue();
    });
  }

  async syncPendingQueue(): Promise<void> {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      const pendingItems = await DatabaseService.getPendingQueue();

      if (pendingItems.length === 0) return;

      console.log(`🔄 Sincronizando ${pendingItems.length} elementos pendientes...`);

      for (const item of pendingItems) {
        try {
          await this.processQueueItem(item);
        } catch (error) {
          console.error('❌ Error al procesar item:', error);
          const attempts = (item.attempts || 0) + 1;
          
          if (attempts >= item.max_attempts) {
            await DatabaseService.updateQueueStatus(item.id, 'failed');
            console.log(`❌ Item ${item.id} falló después de ${attempts} intentos`);
          } else {
            await DatabaseService.updateQueueStatus(item.id, 'pending', attempts);
            console.log(`🔄 Reintentando item ${item.id} (${attempts}/${item.max_attempts})`);
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async processQueueItem(item: any): Promise<void> {
    try {
      const data = JSON.parse(item.data);
      const token = await SecureStorageService.getAccessToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      switch (item.operation) {
        case 'create_habit':
          await api.post('/habits', data);
          break;
        case 'update_habit':
          await api.put(`/habits/${item.entity_id}`, data);
          break;
        case 'delete_habit':
          await api.delete(`/habits/${item.entity_id}`);
          break;
        default:
          console.warn('⚠️ Operación desconocida:', item.operation);
      }

      await DatabaseService.updateQueueStatus(item.id, 'completed');
      console.log(`✅ Item ${item.id} sincronizado correctamente`);
    } catch (error: any) {
      console.error(`❌ Error al sincronizar item ${item.id}:`, error);
      throw error;
    }
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  resolveConflict(localData: any, serverData: any): any {
    const localTime = new Date(localData.updated_at).getTime();
    const serverTime = new Date(serverData.updated_at).getTime();
    
    if (serverTime > localTime) {
      console.log('📥 Prevalece datos del servidor');
      return serverData;
    } else if (localTime > serverTime) {
      console.log('📤 Prevalece datos locales');
      return localData;
    } else {
      console.log('⚖️ Empate, prevalece datos del servidor');
      return serverData;
    }
  }
}

export default new SyncService();