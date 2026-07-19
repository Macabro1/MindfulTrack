const userModel = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/response');

const userController = {
    // Obtener perfil del usuario autenticado
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await userModel.findById(userId);
            
            if (!user) {
                return errorResponse(res, 'Usuario no encontrado', 404);
            }
            
            return successResponse(res, 'Perfil obtenido correctamente', user);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    // Listar todos los usuarios (solo admin)
    async getAllUsers(req, res) {
        try {
            const users = await userModel.findAll();
            return successResponse(res, 'Usuarios obtenidos correctamente', users);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    // Obtener usuario por ID (solo admin)
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userModel.findById(id);
            
            if (!user) {
                return errorResponse(res, 'Usuario no encontrado', 404);
            }
            
            return successResponse(res, 'Usuario obtenido correctamente', user);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    // Actualizar perfil del usuario autenticado
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { nombre, apellido, correo } = req.body;
            
            // Verificar si el correo ya está en uso por otro usuario
            if (correo) {
                const existingUser = await userModel.findByEmail(correo);
                if (existingUser && existingUser.id !== userId) {
                    return errorResponse(res, 'El correo ya está en uso', 400);
                }
            }
            
            const updated = await userModel.update(userId, { nombre, apellido, correo });
            
            if (!updated) {
                return errorResponse(res, 'No se pudo actualizar el perfil', 400);
            }
            
            const user = await userModel.findById(userId);
            return successResponse(res, 'Perfil actualizado correctamente', user);
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    // Cambiar contraseña
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { passwordActual, passwordNueva } = req.body;
            
            if (!passwordActual || !passwordNueva) {
                return errorResponse(res, 'La contraseña actual y nueva son obligatorias', 400);
            }
            
            const user = await userModel.findById(userId);
            if (!user) {
                return errorResponse(res, 'Usuario no encontrado', 404);
            }
            
            // Verificar contraseña actual
            const bcrypt = require('bcrypt');
            const passwordValida = await bcrypt.compare(passwordActual, user.password);
            
            if (!passwordValida) {
                return errorResponse(res, 'Contraseña actual incorrecta', 401);
            }
            
            // Hashear nueva contraseña
            const hashedPassword = await bcrypt.hash(passwordNueva, 10);
            
            const updated = await userModel.updatePassword(userId, hashedPassword);
            
            if (!updated) {
                return errorResponse(res, 'No se pudo cambiar la contraseña', 400);
            }
            
            return successResponse(res, 'Contraseña actualizada correctamente');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    },

    // Eliminar usuario (solo admin)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            // No permitir eliminar a sí mismo
            if (parseInt(id) === req.user.id) {
                return errorResponse(res, 'No puedes eliminarte a ti mismo', 400);
            }
            
            const deleted = await userModel.delete(id);
            
            if (!deleted) {
                return errorResponse(res, 'Usuario no encontrado', 404);
            }
            
            return successResponse(res, 'Usuario eliminado correctamente');
        } catch (error) {
            return errorResponse(res, error.message, 500);
        }
    }
};

module.exports = userController;