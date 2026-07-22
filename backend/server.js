require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/database");

// Importar worker de notificaciones
const { notificationWorker } = require("./src/queues/notificationQueue");

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conexión exitosa a MySQL");
        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
            if (notificationWorker) {
                console.log(`📨 Worker de notificaciones iniciado`);
            } else {
                console.log(`📨 Cola de trabajo en modo simulación (sin Redis)`);
            }
        });
    } catch (error) {
        console.error("❌ Error al conectar con MySQL");
        console.error(error);
        process.exit(1);
    }
}

iniciarServidor();