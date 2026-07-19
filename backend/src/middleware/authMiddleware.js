const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authMiddleware = {
    // Verificar token JWT
    verifyToken: (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Token no proporcionado', 401);
        }
        
        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return errorResponse(res, 'Token expirado', 401);
            }
            return errorResponse(res, 'Token inválido', 401);
        }
    },
    
    // Verificar si es administrador
    isAdmin: (req, res, next) => {
        if (req.user.rol !== 'Administrador' && req.user.rol !== 'Admin') {
            return errorResponse(res, 'Acceso denegado. Se requiere rol de administrador', 403);
        }
        next();
    }
};

module.exports = authMiddleware;