const express = require("express");
const router = express.Router();

const habitController = require("../controllers/habitController");
const authMiddleware = require("../middleware/authMiddleware");

// Todas las rutas de hábitos requieren autenticación
router.use(authMiddleware.verifyToken);

/**
 * @swagger
 * /api/habits:
 *   post:
 *     summary: Crear un nuevo hábito
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HabitRequest'
 *     responses:
 *       201:
 *         description: Hábito creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Hábito creado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     objetivo_diario:
 *                       type: integer
 *                     usuario_id:
 *                       type: integer
 *       400:
 *         description: Error en la validación
 *       401:
 *         description: No autorizado
 */
router.post("/", habitController.createHabit);

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Listar todos los hábitos del usuario autenticado
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de hábitos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Hábitos obtenidos correctamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       objetivo_diario:
 *                         type: integer
 *                       progreso_actual:
 *                         type: integer
 *                       completado:
 *                         type: boolean
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 */
router.get("/", habitController.getHabits);

/**
 * @swagger
 * /api/habits/{id}:
 *   get:
 *     summary: Obtener un hábito por ID
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hábito
 *     responses:
 *       200:
 *         description: Hábito obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Hábito obtenido correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *                     objetivo_diario:
 *                       type: integer
 *                     progreso_actual:
 *                       type: integer
 *                     completado:
 *                       type: boolean
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Hábito no encontrado
 */
router.get("/:id", habitController.getHabitById);

/**
 * @swagger
 * /api/habits/{id}:
 *   put:
 *     summary: Actualizar un hábito
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hábito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Leer 45 minutos
 *               descripcion:
 *                 type: string
 *                 example: Leer un libro de hábitos y productividad
 *               objetivo_diario:
 *                 type: integer
 *                 example: 45
 *               completado:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Hábito actualizado correctamente
 *       400:
 *         description: Error en la validación
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Hábito no encontrado
 */
router.put("/:id", habitController.updateHabit);

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     summary: Eliminar un hábito
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hábito
 *     responses:
 *       200:
 *         description: Hábito eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Hábito eliminado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Hábito no encontrado
 */
router.delete("/:id", habitController.deleteHabit);

module.exports = router;