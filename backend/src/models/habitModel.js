const pool = require("../config/database");

// ============================================
// CREAR HÁBITO
// ============================================
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

// ============================================
// BUSCAR HÁBITO POR NOMBRE Y USUARIO
// ============================================
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

// ============================================
// ✅ OBTENER TODOS LOS HÁBITOS (VERSIÓN SIMPLIFICADA)
//    Elimina JSON_ARRAYAGG para evitar errores
// ============================================
const findAllByUser = async (usuario_id) => {
    try {
        console.log('🔍 Buscando hábitos para usuario:', usuario_id);
        
        const [rows] = await pool.query(
            `SELECT
                h.id,
                h.usuario_id,
                h.nombre,
                h.descripcion,
                h.objetivo_diario,
                h.activo,
                h.completado,
                h.fecha_creacion AS created_at,
                h.frecuencia,
                h.color,
                h.icono,
                h.updated_at
             FROM habits h
             WHERE h.usuario_id = ?
               AND h.activo = 1
             ORDER BY h.id DESC`,
            [usuario_id]
        );
        
        console.log('✅ Hábitos encontrados:', rows.length);
        return rows;
    } catch (error) {
        console.error('❌ Error en findAllByUser:', error);
        throw error;
    }
};

// ============================================
// ✅ OBTENER HÁBITOS CON PAGINACIÓN
// ============================================
const findAllByUserPaginated = async (usuario_id, options = {}) => {
    const { 
        page = 1, 
        limit = 10,
        search = '',
        sort = 'h.id DESC'
    } = options;
    
    const offset = (page - 1) * limit;
    
    let query = `
        SELECT
            h.id,
            h.usuario_id,
            h.nombre,
            h.descripcion,
            h.objetivo_diario,
            h.activo,
            h.completado,
            h.fecha_creacion AS created_at,
            h.frecuencia,
            h.color,
            h.icono,
            h.updated_at
        FROM habits h
        WHERE h.usuario_id = ?
          AND h.activo = 1
    `;
    
    const params = [usuario_id];
    
    if (search) {
        query += ` AND h.nombre LIKE ?`;
        params.push(`%${search}%`);
    }
    
    query += ` ORDER BY ${sort} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    return rows;
};

// ============================================
// CONTAR HÁBITOS DEL USUARIO
// ============================================
const countByUser = async (usuario_id, search = '') => {
    let query = `SELECT COUNT(*) AS total FROM habits WHERE usuario_id = ? AND activo = 1`;
    const params = [usuario_id];
    
    if (search) {
        query += ` AND nombre LIKE ?`;
        params.push(`%${search}%`);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0].total;
};

// ============================================
// OBTENER HÁBITO POR ID Y USUARIO
// ============================================
const findByIdAndUser = async (id, usuario_id) => {
    const [rows] = await pool.query(
        `SELECT
            id,
            usuario_id,
            nombre,
            descripcion,
            objetivo_diario,
            activo,
            completado,
            fecha_creacion AS created_at,
            frecuencia,
            color,
            icono,
            updated_at
         FROM habits
         WHERE id = ?
           AND usuario_id = ?
           AND activo = 1`,
        [id, usuario_id]
    );

    return rows[0];
};

// ============================================
// OBTENER HÁBITO CON ESTADO DE COMPLETADO
// ============================================
const findByIdWithStatus = async (id, usuario_id) => {
    const [rows] = await pool.query(
        `SELECT
            id,
            usuario_id,
            nombre,
            descripcion,
            objetivo_diario,
            activo,
            completado,
            fecha_creacion AS created_at
         FROM habits
         WHERE id = ? AND usuario_id = ?`,
        [id, usuario_id]
    );

    return rows[0];
};

// ============================================
// ACTUALIZAR HÁBITO
// ============================================
const update = async (id, usuario_id, habit) => {
    const {
        nombre,
        descripcion,
        objetivo_diario,
        completado
    } = habit;

    let setClauses = [];
    let params = [];
    
    if (nombre !== undefined) {
        setClauses.push('nombre = ?');
        params.push(nombre);
    }
    if (descripcion !== undefined) {
        setClauses.push('descripcion = ?');
        params.push(descripcion);
    }
    if (objetivo_diario !== undefined) {
        setClauses.push('objetivo_diario = ?');
        params.push(objetivo_diario);
    }
    if (completado !== undefined) {
        setClauses.push('completado = ?');
        params.push(completado);
    }
    
    if (setClauses.length === 0) {
        return false;
    }
    
    const [result] = await pool.query(
        `UPDATE habits
         SET ${setClauses.join(', ')}, updated_at = NOW()
         WHERE id = ? AND usuario_id = ?`,
        [...params, id, usuario_id]
    );

    return result.affectedRows > 0;
};

// ============================================
// ELIMINACIÓN LÓGICA
// ============================================
const remove = async (id, usuario_id) => {
    const [result] = await pool.query(
        `UPDATE habits
         SET activo = 0, updated_at = NOW()
         WHERE id = ? AND usuario_id = ?`,
        [id, usuario_id]
    );

    return result.affectedRows > 0;
};

// ============================================
// EXPORTAR MÓDULO
// ============================================
module.exports = {
    create,
    findByNameAndUser,
    findAllByUser,
    findAllByUserPaginated,
    countByUser,
    findByIdAndUser,
    findByIdWithStatus,
    update,
    remove
};