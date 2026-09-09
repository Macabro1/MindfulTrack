import { HabitRemoteSource } from '../sources/HabitRemoteSource';
import { HabitLocalSource } from '../sources/HabitLocalSource';
import { Habit, habitFromServer, habitToServer } from '../../models/Habit';
import { translateError } from '../../services/api';

export class HabitRepository {
  private remoteSource: HabitRemoteSource;
  private localSource: HabitLocalSource;

  constructor() {
    this.remoteSource = new HabitRemoteSource();
    this.localSource = new HabitLocalSource();
  }

  // Obtener hábitos (prioridad: remoto → local)
  async getHabits(): Promise<Habit[]> {
    try {
      // 1. Intentar obtener del remoto
      const remoteHabits = await this.remoteSource.getHabits();
      
      // 2. Guardar en local
      for (const habit of remoteHabits) {
        await this.localSource.saveHabit(habit);
      }
      
      return remoteHabits;
    } catch (error) {
      // 3. Si falla, obtener del local
      console.log('⚠️ Usando datos locales');
      return await this.localSource.getHabits();
    }
  }

  // Crear hábito (NO idempotente - se guarda en cola si falla)
  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    try {
      // 1. Intentar crear en el remoto
      const created = await this.remoteSource.createHabit(habit);
      
      // 2. Guardar en local como sincronizado
      await this.localSource.saveHabit(created);
      
      return created;
    } catch (error: any) {
      // 3. Si falla, guardar localmente con estado pendiente
      const localHabit: Habit = {
        id: `local_${Date.now()}`,
        name: habit.name || '',
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        color: habit.color || '#4CAF50',
        icon: habit.icon || '📝',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      };
      
      await this.localSource.saveHabit(localHabit);
      await this.localSource.addToQueue('create_habit', localHabit.id, habitToServer(habit));
      
      // Lanzar error con mensaje amigable
      throw new Error('Hábito guardado localmente. Se sincronizará cuando haya conexión.');
    }
  }

  // Actualizar hábito (idempotente - con reintentos)
  async updateHabit(id: string | number, habit: Partial<Habit>): Promise<Habit> {
    try {
      // Operación idempotente (PUT)
      const updated = await this.remoteSource.updateHabit(id, habit);
      await this.localSource.saveHabit(updated);
      return updated;
    } catch (error) {
      // Guardar localmente para sincronización posterior
      const localHabits = await this.localSource.getHabits();
      const existing = localHabits.find(h => h.id === id.toString());
      if (existing) {
        const updated = { ...existing, ...habit, syncStatus: 'pending' };
        await this.localSource.saveHabit(updated);
        await this.localSource.addToQueue('update_habit', id.toString(), habitToServer(habit));
      }
      throw error;
    }
  }

  // Eliminar hábito (idempotente - con reintentos)
  async deleteHabit(id: string | number): Promise<void> {
    try {
      await this.remoteSource.deleteHabit(id);
      await this.localSource.deleteHabit(id.toString());
    } catch (error) {
      // Marcar localmente como eliminado
      await this.localSource.deleteHabit(id.toString());
      await this.localSource.addToQueue('delete_habit', id.toString(), { id });
      throw error;
    }
  }

  // Sincronizar operaciones pendientes
  async syncPending(): Promise<void> {
    const pending = await this.localSource.getPendingSync();
    
    for (const item of pending) {
      try {
        const data = JSON.parse(item.data);
        
        switch (item.operation) {
          case 'create_habit':
            await this.remoteSource.createHabit(data);
            break;
          case 'update_habit':
            await this.remoteSource.updateHabit(item.entity_id, data);
            break;
          case 'delete_habit':
            await this.remoteSource.deleteHabit(item.entity_id);
            break;
        }
        
        // Eliminar de la cola si fue exitoso
        await DatabaseService.updateQueueStatus(item.id, 'completed');
        console.log(`✅ Operación ${item.id} sincronizada`);
      } catch (error) {
        // Reintentar con backoff exponencial
        const attempts = (item.attempts || 0) + 1;
        if (attempts >= item.max_attempts) {
          await DatabaseService.updateQueueStatus(item.id, 'failed');
          console.log(`❌ Operación ${item.id} falló permanentemente`);
        } else {
          await DatabaseService.updateQueueStatus(item.id, 'pending', attempts);
          console.log(`🔄 Reintentando ${item.id} (${attempts}/${item.max_attempts})`);
        }
      }
    }
  }

  // Limpiar todos los datos locales
  async clearLocalData(): Promise<void> {
    await this.localSource.clearAll();
  }

  // Obtener estadísticas
  async getStats(): Promise<any> {
    return await this.localSource.getStats();
  }
}