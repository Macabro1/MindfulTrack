const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

/**
 * @swagger
 * /api/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     correo:
 *                       type: string
 *                     activo:
 *                       type: boolean
 *                     fecha_registro:
 *                       type: string
 *                       format: date-time
 *                     rol:
 *                       type: string
 *       401:
 *         description: No autorizado - Token inválido o expirado
 */
router.get('/perfil', userController.getProfile);

/**
 * @swagger
 * /api/perfil:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos
 *               apellido:
 *                 type: string
 *                 example: Chiriboga
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: carlos@test.com
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Error en la validación
 *       401:
 *         description: No autorizado
 */
router.put('/perfil', userController.updateProfile);

/**
 * @swagger
 * /api/perfil/password:
 *   put:
 *     summary: Cambiar contraseña del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordActual
 *               - passwordNueva
 *             properties:
 *               passwordActual:
 *                 type: string
 *                 example: 123456
 *               passwordNueva:
 *                 type: string
 *                 minLength: 6
 *                 example: nueva123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error en la validación
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.put('/perfil/password', userController.changePassword);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       apellido:
 *                         type: string
 *                       correo:
 *                         type: string
 *                       activo:
 *                         type: boolean
 *                       fecha_registro:
 *                         type: string
 *                         format: date-time
 *                       rol:
 *                         type: string
 *       403:
 *         description: Acceso denegado - Se requiere rol de administrador
 *       401:
 *         description: No autorizado
 */
router.get('/usuarios', authMiddleware.isAdmin, userController.getAllUsers);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/usuarios/:id', authMiddleware.isAdmin, userController.getUserById);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       400:
 *         description: No puedes eliminarte a ti mismo
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/usuarios/:id', authMiddleware.isAdmin, userController.deleteUser);

module.exports = router;