const habitModel = require("../models/habitModel");

// Crear hábito
const createHabit = async (usuario_id, data) => {
    const { nombre, descripcion, objetivo_diario } = data;

    // Validaciones
    if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del hábito es obligatorio.");
    }

    if (nombre.length > 100) {
        throw new Error("El nombre del hábito no puede superar los 100 caracteres.");
    }

    if (descripcion && descripcion.length > 255) {
        throw new Error("La descripción no puede superar los 255 caracteres.");
    }

    if (
        objetivo_diario === undefined ||
        objetivo_diario === null ||
        isNaN(objetivo_diario) ||
        Number(objetivo_diario) <= 0
    ) {
        throw new Error("El objetivo diario debe ser un número mayor a 0.");
    }

    // Regla de negocio:
    // no permitir hábitos activos duplicados con el mismo nombre para el mismo usuario
    const habitExists = await habitModel.findByNameAndUser(
        usuario_id,
        nombre.trim()
    );

    if (habitExists) {
        throw new Error("Ya tienes un hábito activo con ese nombre.");
    }

    const habitId = await habitModel.create({
        usuario_id,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        objetivo_diario: Number(objetivo_diario)
    });

    return {
        id: habitId,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        objetivo_diario: Number(objetivo_diario)
    };
};

// Listar hábitos del usuario
const getHabitsByUser = async (usuario_id) => {
    return await habitModel.findAllByUser(usuario_id);
};

// Obtener un hábito específico
const getHabitById = async (id, usuario_id) => {
    const habit = await habitModel.findByIdAndUser(id, usuario_id);

    if (!habit || habit.activo === 0) {
        throw new Error("Hábito no encontrado.");
    }

    return habit;
};

// Actualizar hábito
const updateHabit = async (id, usuario_id, data) => {
    const { nombre, descripcion, objetivo_diario } = data;

    const habit = await habitModel.findByIdAndUser(id, usuario_id);

    if (!habit || habit.activo === 0) {
        throw new Error("Hábito no encontrado.");
    }

    // Validaciones
    if (!nombre || nombre.trim() === "") {
        throw new Error("El nombre del hábito es obligatorio.");
    }

    if (nombre.length > 100) {
        throw new Error("El nombre del hábito no puede superar los 100 caracteres.");
    }

    if (descripcion && descripcion.length > 255) {
        throw new Error("La descripción no puede superar los 255 caracteres.");
    }

    if (
        objetivo_diario === undefined ||
        objetivo_diario === null ||
        isNaN(objetivo_diario) ||
        Number(objetivo_diario) <= 0
    ) {
        throw new Error("El objetivo diario debe ser un número mayor a 0.");
    }

    // Regla de negocio:
    // si cambia el nombre, verificar duplicados
    if (habit.nombre.toLowerCase() !== nombre.trim().toLowerCase()) {
        const habitExists = await habitModel.findByNameAndUser(
            usuario_id,
            nombre.trim()
        );

        if (habitExists) {
            throw new Error("Ya tienes un hábito activo con ese nombre.");
        }
    }

    const updated = await habitModel.update(id, usuario_id, {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        objetivo_diario: Number(objetivo_diario)
    });

    if (!updated) {
        throw new Error("No se pudo actualizar el hábito.");
    }

    return {
        id: Number(id),
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        objetivo_diario: Number(objetivo_diario)
    };
};

// Eliminar hábito (lógico)
const deleteHabit = async (id, usuario_id) => {
    const habit = await habitModel.findByIdAndUser(id, usuario_id);

    if (!habit || habit.activo === 0) {
        throw new Error("Hábito no encontrado.");
    }

    const deleted = await habitModel.remove(id, usuario_id);

    if (!deleted) {
        throw new Error("No se pudo eliminar el hábito.");
    }

    return true;
};

module.exports = {
    createHabit,
    getHabitsByUser,
    getHabitById,
    updateHabit,
    deleteHabit
};