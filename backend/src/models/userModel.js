const pool = require("../config/database");

const userModel = {
    // Buscar usuario por correo
    findByEmail: async (correo) => {
        const [rows] = await pool.query(
            `SELECT
                u.id,
                u.nombre,
                u.apellido,
                u.correo,
                u.password,
                u.activo,
                r.id AS rol_id,
                r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r
                ON u.rol_id = r.id
            WHERE u.correo = ?`,
            [correo]
        );
        return rows[0];
    },

    // Buscar usuario por ID
    findById: async (id) => {
        const [rows] = await pool.query(
            `SELECT
                u.id,
                u.nombre,
                u.apellido,
                u.correo,
                u.activo,
                u.fecha_registro,
                r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r
                ON u.rol_id = r.id
            WHERE u.id = ?`,
            [id]
        );
        return rows[0];
    },

    // Buscar usuario por ID (con contraseña para verificación)
    findByIdWithPassword: async (id) => {
        const [rows] = await pool.query(
            `SELECT
                u.id,
                u.nombre,
                u.apellido,
                u.correo,
                u.password,
                u.activo,
                r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r
                ON u.rol_id = r.id
            WHERE u.id = ?`,
            [id]
        );
        return rows[0];
    },

    // Crear usuario
    create: async (usuario) => {
        const {
            nombre,
            apellido,
            correo,
            password,
            rol_id
        } = usuario;

        const [result] = await pool.query(
            `INSERT INTO usuarios
            (nombre, apellido, correo, password, rol_id)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nombre,
                apellido,
                correo,
                password,
                rol_id
            ]
        );
        return result.insertId;
    },

    // Actualizar perfil de usuario
    update: async (id, userData) => {
        const { nombre, apellido, correo } = userData;
        
        const [result] = await pool.query(
            `UPDATE usuarios 
             SET nombre = ?, apellido = ?, correo = ? 
             WHERE id = ?`,
            [nombre, apellido, correo, id]
        );
        return result.affectedRows > 0;
    },

    // Cambiar contraseña
    updatePassword: async (id, newPassword) => {
        const [result] = await pool.query(
            `UPDATE usuarios 
             SET password = ? 
             WHERE id = ?`,
            [newPassword, id]
        );
        return result.affectedRows > 0;
    },

    // Obtener todos los usuarios (solo activos)
    findAll: async () => {
        const [rows] = await pool.query(
            `SELECT
                u.id,
                u.nombre,
                u.apellido,
                u.correo,
                u.activo,
                u.fecha_registro,
                r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r
                ON u.rol_id = r.id
            WHERE u.activo = 1
            ORDER BY u.id DESC`
        );
        return rows;
    },

    // Eliminar usuario (borrado lógico)
    delete: async (id) => {
        const [result] = await pool.query(
            `UPDATE usuarios 
             SET activo = 0 
             WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = userModel;