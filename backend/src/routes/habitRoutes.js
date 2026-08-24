const express = require("express");
const router = express.Router();

// ⚠️ IMPORTANTE: NO IMPORTAR authMiddleware
const habitController = require("../controllers/habitController");

// ✅ TODAS LAS RUTAS SIN AUTENTICACIÓN
router.post("/", habitController.createHabit);
router.get("/", habitController.getHabits);
router.get("/:id", habitController.getHabitById);
router.put("/:id", habitController.updateHabit);
router.delete("/:id", habitController.deleteHabit);

module.exports = router;