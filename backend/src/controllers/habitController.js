const habitModel = require('../models/habitModel');
const { successResponse, errorResponse } = require('../utils/response');

const habitController = {
    // ✅ GET - Listar hábitos (usuario ID 1 fijo para pruebas)
    getHabits: async (req, res) => {
        try {
            const userId = 1;
            const habits = await habitModel.findAllByUser(userId);
            return successResponse(res, 'Hábitos obtenidos correctamente', habits);
        } catch (error) {
            console.error('❌ Error en getHabits:', error);
            return errorResponse(res, 'Error al obtener hábitos', 500);
        }
    },

    // ✅ GET - Obtener hábito por ID
    getHabitById: async (req, res) => {
        try {
            const userId = 1;
            const { id } = req.params;
            const habit = await habitModel.findByIdAndUser(id, userId);
            if (!habit) {
                return errorResponse(res, 'Hábito no encontrado', 404);
            }
            return successResponse(res, 'Hábito obtenido correctamente', habit);
        } catch (error) {
            console.error('❌ Error en getHabitById:', error);
            return errorResponse(res, 'Error al obtener hábito', 500);
        }
    },

    // ✅ POST - Crear hábito
    createHabit: async (req, res) => {
        try {
            const userId = 1;
            const { nombre, descripcion, objetivo_diario } = req.body;

            if (!nombre || !objetivo_diario) {
                return errorResponse(res, 'Nombre y objetivo diario son obligatorios', 400);
            }

            const habitId = await habitModel.create({
                usuario_id: userId,
                nombre,
                descripcion: descripcion || '',
                objetivo_diario
            });

            return successResponse(res, 'Hábito creado correctamente', { id: habitId }, 201);
        } catch (error) {
            console.error('❌ Error en createHabit:', error);
            return errorResponse(res, 'Error al crear hábito', 500);
        }
    },

    // ✅ PUT - Actualizar hábito
    updateHabit: async (req, res) => {
        try {
            const userId = 1;
            const { id } = req.params;
            const { nombre, descripcion, objetivo_diario, completado } = req.body;

            const habit = await habitModel.findByIdAndUser(id, userId);
            if (!habit) {
                return errorResponse(res, 'Hábito no encontrado', 404);
            }

            const updated = await habitModel.update(id, userId, {
                nombre,
                descripcion,
                objetivo_diario,
                completado
            });

            if (!updated) {
                return errorResponse(res, 'No se pudo actualizar el hábito', 400);
            }

            return successResponse(res, 'Hábito actualizado correctamente');
        } catch (error) {
            console.error('❌ Error en updateHabit:', error);
            return errorResponse(res, 'Error al actualizar hábito', 500);
        }
    },

    // ✅ DELETE - Eliminar hábito
    deleteHabit: async (req, res) => {
        try {
            const userId = 1;
            const { id } = req.params;

            const habit = await habitModel.findByIdAndUser(id, userId);
            if (!habit) {
                return errorResponse(res, 'Hábito no encontrado', 404);
            }

            const deleted = await habitModel.remove(id, userId);
            if (!deleted) {
                return errorResponse(res, 'No se pudo eliminar el hábito', 400);
            }

            return successResponse(res, 'Hábito eliminado correctamente');
        } catch (error) {
            console.error('❌ Error en deleteHabit:', error);
            return errorResponse(res, 'Error al eliminar hábito', 500);
        }
    }
};

module.exports = habitController;