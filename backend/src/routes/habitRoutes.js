const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const habitController = require("../controllers/habitController");

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
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               objetivo_diario:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Hábito creado correctamente
 *       401:
 *         description: Token no proporcionado
 */
router.post("/", authMiddleware.verifyToken, habitController.createHabit);

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Listar hábitos del usuario autenticado
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hábitos obtenidos correctamente
 *       401:
 *         description: Token no proporcionado
 */
router.get("/", authMiddleware.verifyToken, habitController.getHabits);

/**
 * @swagger
 * /api/habits/{id}:
 *   get:
 *     summary: Obtener un hábito por ID
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware.verifyToken, habitController.getHabitById);

/**
 * @swagger
 * /api/habits/{id}:
 *   put:
 *     summary: Actualizar un hábito
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware.verifyToken, habitController.updateHabit);

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     summary: Eliminar un hábito
 *     tags: [Hábitos]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware.verifyToken, habitController.deleteHabit);

module.exports = router;