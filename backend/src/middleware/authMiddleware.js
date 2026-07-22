const jwt = require('jsonwebtoken');
const { cacheAside, invalidateCache } = require('../utils/cache');
const userModel = require('../models/userModel');
const { errorResponse } = require('../utils/response');

const authMiddleware = {
    /**
     * Verificar token JWT con validación de usuario en BD (con caché)
     */
    verifyToken: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Token no proporcionado', 401);
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
            // 1. Decodificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 2. Verificar usuario en BD (con caché)
            const cacheKey = `user:${decoded.id}`;
            const user = await cacheAside(
                cacheKey,
                60, // TTL: 1 minuto
                async () => {
                    const userData = await userModel.findById(decoded.id);
                    if (!userData) {
                        throw new Error('Usuario no existe');
                    }
                    return userData;
                }
            );
            
            // 3. Verificar que el usuario esté activo
            if (!user.activo) {
                return errorResponse(res, 'Usuario desactivado', 401);
            }
            
            // 4. Adjuntar información del usuario a la request
            req.user = {
                id: user.id,
                correo: user.correo,
                rol: user.rol,
                activo: user.activo,
                nombre: user.nombre,
                apellido: user.apellido
            };
            
            next();
            
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return errorResponse(res, 'Token expirado', 401);
            }
            if (error.message === 'Usuario no existe') {
                return errorResponse(res, 'Usuario no encontrado', 401);
            }
            return errorResponse(res, 'Token inválido', 401);
        }
    },
    
    /**
     * Verificar si el usuario es administrador
     */
    isAdmin: (req, res, next) => {
        if (!req.user || (req.user.rol !== 'Administrador' && req.user.rol !== 'Admin')) {
            return errorResponse(res, 'Acceso denegado. Se requiere rol de administrador', 403);
        }
        next();
    },
    
    /**
     * Invalidar caché de usuario (cuando se actualiza el perfil)
     */
    invalidateUserCache: (userId) => {
        invalidateCache(`user:${userId}`);
    }
};

module.exports = authMiddleware;