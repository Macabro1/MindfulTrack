const habitModel = require('../models/habitModel');
const { successResponse, errorResponse } = require('../utils/response');
const { cacheAside, invalidateCache } = require('../utils/cache');
const { notificationQueue } = require('../queues/notificationQueue');

const habitController = {
    /**
     * GET /api/habits - Obtener todos los hábitos del usuario (con caché)
     */
    getHabits: async (req, res) => {
        try {
            const userId = req.user.id;
            const cacheKey = `habits:${userId}`;
            
            const habits = await cacheAside(
                cacheKey,
                300, // TTL: 5 minutos
                async () => {
                    return await habitModel.findAllByUser(userId);
                }
            );
            
            return successResponse(res, 'Hábitos obtenidos correctamente', habits);
        } catch (error) {
            console.error('❌ Error en getHabits:', error);
            return errorResponse(res, 'Error al obtener hábitos', 500);
        }
    },

    /**
     * GET /api/habits/paginated - Obtener hábitos con paginación
     */
    getHabitsPaginated: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, search = '' } = req.query;
            
            const habits = await habitModel.findAllByUserPaginated(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                search: search
            });
            
            const total = await habitModel.countByUser(userId, search);
            
            return successResponse(res, 'Hábitos obtenidos correctamente', {
                data: habits,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('❌ Error en getHabitsPaginated:', error);
            return errorResponse(res, 'Error al obtener hábitos', 500);
        }
    },

    /**
     * GET /api/habits/:id - Obtener un hábito por ID
     */
    getHabitById: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            
            const habit = await habitModel.findByIdAndUser(id, userId);
            
            if (!habit) {
                return errorResponse(res, 'Hábito no encontrado', 404);
            }
            
            return successResponse(res, 'Hábito obtenido correctamente', habit);
        } catch (error) {
            console.error('❌ Error en getHabitById:', error);
            return errorResponse(res, 'Error al obtener el hábito', 500);
        }
    },

    /**
     * POST /api/habits - Crear un nuevo hábito
     */
    createHabit: async (req, res) => {
        try {
            const userId = req.user.id;
            const { nombre, descripcion, objetivo_diario } = req.body;

            // Validar campos obligatorios
            if (!nombre || !objetivo_diario) {
                return errorResponse(res, 'Nombre y objetivo diario son obligatorios', 400);
            }

            // Verificar si ya existe un hábito con ese nombre
            const existing = await habitModel.findByNameAndUser(userId, nombre);
            if (existing) {
                return errorResponse(res, 'Ya tienes un hábito con ese nombre', 409);
            }

            // Crear hábito
            const habitId = await habitModel.create({
                usuario_id: userId,
                nombre,
                descripcion: descripcion || '',
                objetivo_diario
            });

            // Invalidar caché
            invalidateCache(`habits:${userId}`);

            return successResponse(res, 'Hábito creado correctamente', { id: habitId }, 201);
        } catch (error) {
            console.error('❌ Error en createHabit:', error);
            return errorResponse(res, 'Error al crear hábito', 500);
        }
    },

    /**
     * PUT /api/habits/:id - Actualizar un hábito
     */
    updateHabit: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { nombre, descripcion, objetivo_diario, completado } = req.body;

            // Verificar que el hábito existe y pertenece al usuario
            const habit = await habitModel.findByIdWithStatus(id, userId);
            if (!habit) {
                return errorResponse(res, 'Hábito no encontrado', 404);
            }

            // Verificar nombre duplicado (si está cambiando el nombre)
            if (nombre && nombre !== habit.nombre) {
                const existing = await habitModel.findByNameAndUser(userId, nombre);
                if (existing) {
                    return errorResponse(res, 'Ya tienes un hábito con ese nombre', 409);
                }
            }

            // Actualizar hábito
            const updated = await habitModel.update(id, userId, {
                nombre,
                descripcion,
                objetivo_diario,
                completado
            });

            if (!updated) {
                return errorResponse(res, 'No se pudo actualizar el hábito', 400);
            }

            // Si se marcó como completado, enviar notificación asíncrona
            if (completado === true && !habit.completado) {
                await notificationQueue.add('habit-completed', {
                    userId,
                    habitId: habit.id,
                    habitName: habit.nombre
                }, {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 }
                });
                console.log(`📨 Tarea de notificación encolada para hábito ${habit.id}`);
            }

            // Invalidar caché
            invalidateCache(`habits:${userId}`);

            return successResponse(res, 'Hábito actualizado correctamente');
        } catch (error) {
            console.error('❌ Error en updateHabit:', error);
            return errorResponse(res, 'Error al actualizar hábito', 500);
        }
    },

    /**
     * DELETE /api/habits/:id - Eliminar un hábito (borrado lógico)
     */
    deleteHabit: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            // Verificar que el hábito existe y pertenece al usuario
            const habit = await habitModel.findByIdAndUser(id, userId);
            if (!habit) {
                return errorResponse(res, 'Hábito no encontrado', 404);
            }

            // Eliminar lógicamente
            const deleted = await habitModel.remove(id, userId);
            
            if (!deleted) {
                return errorResponse(res, 'No se pudo eliminar el hábito', 400);
            }

            // Invalidar caché
            invalidateCache(`habits:${userId}`);

            return successResponse(res, 'Hábito eliminado correctamente');
        } catch (error) {
            console.error('❌ Error en deleteHabit:', error);
            return errorResponse(res, 'Error al eliminar hábito', 500);
        }
    }
};

module.exports = habitController;