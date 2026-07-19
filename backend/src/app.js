const express = require("express");
const cors = require("cors");

// Swagger
const { swaggerUi, swaggerSpec } = require("../docs/swagger");

// Rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const habitRoutes = require("./routes/habitRoutes");

const app = express();

/* ==========================
   MIDDLEWARES
========================== */
app.use(cors());
app.use(express.json());

/* ==========================
   RUTA PRINCIPAL
========================== */
app.get("/", (req, res) => {
    res.status(200).json({
        proyecto: "MindfulTrack API",
        version: "1.0.0",
        estado: "Backend funcionando correctamente",
        autor: "Carlos Chiriboga"
    });
});

/* ==========================
   DOCUMENTACIÓN SWAGGER
========================== */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ==========================
   RUTAS DE LA API
========================== */
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/habits", habitRoutes);

/* ==========================
   RUTA NO ENCONTRADA
========================== */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada"
    });
});

module.exports = app;