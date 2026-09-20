import * as SQLite from 'expo-sqlite';

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('mindfultrack.db');
    this.initializeTables();
  }

  async initializeTables(): Promise<void> {
    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          frequency TEXT,
          created_at INTEGER,
          updated_at INTEGER,
          last_synced_at INTEGER,
          is_deleted INTEGER DEFAULT 0,
          sync_status TEXT DEFAULT 'synced'
        )
      `);

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS habit_logs (
          id TEXT PRIMARY KEY,
          habit_id TEXT,
          completed INTEGER DEFAULT 0,
          date INTEGER,
          notes TEXT,
          created_at INTEGER,
          sync_status TEXT DEFAULT 'synced',
          FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
      `);

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          operation TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER,
          attempts INTEGER DEFAULT 0,
          max_attempts INTEGER DEFAULT 3,
          next_retry_at INTEGER,
          status TEXT DEFAULT 'pending'
        )
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
        CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
        CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      `);

      console.log('✅ Base de datos local inicializada');
    } catch (error) {
      console.error('❌ Error al inicializar base de datos:', error);
    }
  }

  async getHabits(): Promise<any[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM habits WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
    return result;
  }

  async saveHabit(habit: any): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO habits 
       (id, name, description, frequency, created_at, updated_at, sync_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.name,
        habit.description || '',
        habit.frequency || 'daily',
        habit.created_at || Date.now(),
        habit.updated_at || Date.now(),
        habit.sync_status || 'synced'
      ]
    );
  }

  async deleteHabit(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE habits SET is_deleted = 1, sync_status = "pending" WHERE id = ?',
      [id]
    );
  }

  async addToQueue(operation: string, entityType: string, entityId: string, data: any): Promise<void> {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db.runAsync(
      `INSERT INTO sync_queue (id, operation, entity_type, entity_id, data, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operation,
        entityType,
        entityId,
        JSON.stringify(data),
        Date.now(),
        'pending'
      ]
    );
  }

  async getPendingQueue(): Promise<any[]> {
    const now = Date.now();
    const result = await this.db.getAllAsync(
      `SELECT * FROM sync_queue 
       WHERE status = 'pending' 
       AND (next_retry_at IS NULL OR next_retry_at <= ?)
       ORDER BY created_at ASC`,
      [now]
    );
    return result;
  }

  async updateQueueStatus(id: string, status: string, attempts?: number): Promise<void> {
    const updates: string[] = ['status = ?'];
    const params: any[] = [status];

    if (attempts !== undefined) {
      updates.push('attempts = ?');
      params.push(attempts);
    }

    if (status === 'failed') {
      const nextRetry = Date.now() + Math.pow(2, attempts || 1) * 1000;
      updates.push('next_retry_at = ?');
      params.push(nextRetry);
    }

    params.push(id);
    await this.db.runAsync(
      `UPDATE sync_queue SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  // ============================================
  // NUEVO: RESETEAR ITEMS FALLIDOS A PENDING
  // ============================================
  async resetFailedItems(): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `UPDATE sync_queue 
         SET status = 'pending', attempts = 0, next_retry_at = NULL 
         WHERE status = 'failed'`
      );
      console.log(`🔄 Items fallidos reseteados a pending`);
      return result.changes || 0;
    } catch (error) {
      console.error('❌ Error al resetear items fallidos:', error);
      return 0;
    }
  }

  // ============================================
  // NUEVO: CONTAR ITEMS POR ESTADO
  // ============================================
  async getQueueStats(): Promise<{ pending: number; failed: number; completed: number }> {
    const pending = await this.db.getFirstAsync(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`
    );
    const failed = await this.db.getFirstAsync(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'failed'`
    );
    const completed = await this.db.getFirstAsync(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'completed'`
    );

    return {
      pending: pending?.count || 0,
      failed: failed?.count || 0,
      completed: completed?.count || 0,
    };
  }

  async clearAllData(): Promise<void> {
    await this.db.execAsync(`
      DELETE FROM habits;
      DELETE FROM habit_logs;
      DELETE FROM sync_queue;
      VACUUM;
    `);
    console.log('🧹 Datos locales eliminados correctamente');
  }

  async getStats(): Promise<any> {
    const habitsCount = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM habits WHERE is_deleted = 0'
    );
    const logsCount = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM habit_logs'
    );
    const queueCount = await this.db.getFirstAsync(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`
    );

    return {
      habits: habitsCount?.count || 0,
      logs: logsCount?.count || 0,
      pendingSync: queueCount?.count || 0,
    };
  }
}

export default new DatabaseService();