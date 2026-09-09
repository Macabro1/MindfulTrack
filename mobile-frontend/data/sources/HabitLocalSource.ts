import DatabaseService from '../../services/database';
import { Habit } from '../../models/Habit';

export class HabitLocalSource {
  // Obtener todos los hábitos locales
  async getHabits(): Promise<Habit[]> {
    return await DatabaseService.getHabits();
  }

  // Guardar un hábito localmente
  async saveHabit(habit: Habit): Promise<void> {
    await DatabaseService.saveHabit(habit);
  }

  // Eliminar un hábito localmente
  async deleteHabit(id: string): Promise<void> {
    await DatabaseService.deleteHabit(id);
  }

  // Agregar a la cola de sincronización
  async addToQueue(operation: string, entityId: string, data: any): Promise<void> {
    await DatabaseService.addToQueue(operation, 'habit', entityId, data);
  }

  // Obtener pendientes de sincronización
  async getPendingSync(): Promise<any[]> {
    return await DatabaseService.getPendingQueue();
  }

  // Limpiar todos los datos locales
  async clearAll(): Promise<void> {
    await DatabaseService.clearAllData();
  }

  // Obtener estadísticas
  async getStats(): Promise<any> {
    return await DatabaseService.getStats();
  }
}