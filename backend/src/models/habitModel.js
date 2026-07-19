const pool = require("../config/database");

// Crear hábito
const create = async (habit) => {
    const {
        usuario_id,
        nombre,
        descripcion,
        objetivo_diario
    } = habit;

    const [result] = await pool.query(
        `INSERT INTO habits
        (usuario_id, nombre, descripcion, objetivo_diario)
        VALUES (?, ?, ?, ?)`,
        [usuario_id, nombre, descripcion, objetivo_diario]
    );

    return result.insertId;
};

// Buscar hábito activo por nombre para un usuario
const findByNameAndUser = async (usuario_id, nombre) => {
    const [rows] = await pool.query(
        `SELECT *
         FROM habits
         WHERE usuario_id = ?
           AND nombre = ?
           AND activo = 1`,
        [usuario_id, nombre]
    );

    return rows[0];
};

// Obtener todos los hábitos activos del usuario
const findAllByUser = async (usuario_id) => {
    const [rows] = await pool.query(
        `SELECT
            id,
            usuario_id,
            nombre,
            descripcion,
            objetivo_diario,
            activo,
            fecha_creacion
         FROM habits
         WHERE usuario_id = ?
           AND activo = 1
         ORDER BY id DESC`,
        [usuario_id]
    );

    return rows;
};

// Obtener un hábito por id y usuario
const findByIdAndUser = async (id, usuario_id) => {
    const [rows] = await pool.query(
        `SELECT
            id,
            usuario_id,
            nombre,
            descripcion,
            objetivo_diario,
            activo,
            fecha_creacion
         FROM habits
         WHERE id = ?
           AND usuario_id = ?`,
        [id, usuario_id]
    );

    return rows[0];
};

// Actualizar hábito
const update = async (id, usuario_id, habit) => {
    const {
        nombre,
        descripcion,
        objetivo_diario
    } = habit;

    const [result] = await pool.query(
        `UPDATE habits
         SET nombre = ?, descripcion = ?, objetivo_diario = ?
         WHERE id = ? AND usuario_id = ?`,
        [nombre, descripcion, objetivo_diario, id, usuario_id]
    );

    return result.affectedRows > 0;
};

// Eliminación lógica
const remove = async (id, usuario_id) => {
    const [result] = await pool.query(
        `UPDATE habits
         SET activo = 0
         WHERE id = ? AND usuario_id = ?`,
        [id, usuario_id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    create,
    findByNameAndUser,
    findAllByUser,
    findByIdAndUser,
    update,
    remove
};