import api from '../../services/api';
import { Habit, habitFromServer, habitToServer } from '../../models/Habit';

export class HabitRemoteSource {
  // Obtener todos los hábitos
  async getHabits(): Promise<Habit[]> {
    const response = await api.get('/habits');
    return response.data.map(habitFromServer);
  }

  // Obtener un hábito por ID
  async getHabitById(id: string | number): Promise<Habit> {
    const response = await api.get(`/habits/${id}`);
    return habitFromServer(response.data);
  }

  // Crear un hábito
  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    const data = habitToServer(habit);
    const response = await api.post('/habits', data);
    return habitFromServer(response.data);
  }

  // Actualizar un hábito (idempotente)
  async updateHabit(id: string | number, habit: Partial<Habit>): Promise<Habit> {
    const data = habitToServer(habit);
    const response = await api.put(`/habits/${id}`, data);
    return habitFromServer(response.data);
  }

  // Eliminar un hábito (idempotente)
  async deleteHabit(id: string | number): Promise<void> {
    await api.delete(`/habits/${id}`);
  }
}