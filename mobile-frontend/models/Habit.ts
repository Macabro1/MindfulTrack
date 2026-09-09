// ============================================
// MODELO: Habit (Hábito)
// ============================================
// Documentación de divergencias de nomenclatura:
// - Servidor: snake_case (created_at)
// - Cliente: camelCase (createdAt)

export interface Habit {
  id: string | number;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  color?: string;
  icon?: string;
  createdAt: string;      // Servidor: created_at
  updatedAt: string;      // Servidor: updated_at
  lastSyncedAt?: string;  // Servidor: last_synced_at
  isDeleted?: boolean;    // Servidor: is_deleted
  syncStatus?: 'synced' | 'pending' | 'conflict';
  serverId?: number;      // ID en el servidor
}

// Serialización: Cliente → Servidor
export const habitToServer = (habit: Partial<Habit>): any => {
  const result: any = {};
  
  if (habit.id) result.id = habit.id;
  if (habit.name) result.name = habit.name;
  if (habit.description !== undefined) result.description = habit.description;
  if (habit.frequency) result.frequency = habit.frequency;
  if (habit.color) result.color = habit.color;
  if (habit.icon) result.icon = habit.icon;
  
  // Mapeo de campos (camelCase → snake_case)
  if (habit.createdAt) result.created_at = habit.createdAt;
  if (habit.updatedAt) result.updated_at = habit.updatedAt;
  if (habit.lastSyncedAt) result.last_synced_at = habit.lastSyncedAt;
  if (habit.isDeleted !== undefined) result.is_deleted = habit.isDeleted;
  
  return result;
};

// Serialización: Servidor → Cliente
export const habitFromServer = (data: any): Habit => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    frequency: data.frequency || 'daily',
    color: data.color || '#4CAF50',
    icon: data.icon || '📝',
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    lastSyncedAt: data.last_synced_at || data.lastSyncedAt,
    isDeleted: data.is_deleted || data.isDeleted || false,
    syncStatus: data.syncStatus || 'synced',
    serverId: data.id,
  };
};

// Crear un hábito vacío (para formularios)
export const createEmptyHabit = (): Partial<Habit> => ({
  name: '',
  description: '',
  frequency: 'daily',
  color: '#4CAF50',
  icon: '📝',
});