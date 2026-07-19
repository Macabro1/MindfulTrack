const habitService = require("../services/habitService");
const { successResponse, errorResponse } = require("../utils/response");

// Crear hábito
const createHabit = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const habit = await habitService.createHabit(usuario_id, req.body);

        return successResponse(
            res,
            "Hábito creado correctamente.",
            habit,
            201
        );
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};

// Listar hábitos del usuario autenticado
const getHabits = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const habits = await habitService.getHabitsByUser(usuario_id);

        return successResponse(
            res,
            "Hábitos obtenidos correctamente.",
            habits,
            200
        );
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

// Obtener hábito por ID
const getHabitById = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const { id } = req.params;

        const habit = await habitService.getHabitById(id, usuario_id);

        return successResponse(
            res,
            "Hábito obtenido correctamente.",
            habit,
            200
        );
    } catch (error) {
        return errorResponse(res, error.message, 404);
    }
};

// Actualizar hábito
const updateHabit = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const { id } = req.params;

        const habit = await habitService.updateHabit(id, usuario_id, req.body);

        return successResponse(
            res,
            "Hábito actualizado correctamente.",
            habit,
            200
        );
    } catch (error) {
        return errorResponse(res, error.message, 400);
    }
};

// Eliminar hábito (lógico)
const deleteHabit = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const { id } = req.params;

        await habitService.deleteHabit(id, usuario_id);

        return successResponse(
            res,
            "Hábito eliminado correctamente.",
            null,
            200
        );
    } catch (error) {
        return errorResponse(res, error.message, 404);
    }
};

module.exports = {
    createHabit,
    getHabits,
    getHabitById,
    updateHabit,
    deleteHabit
};