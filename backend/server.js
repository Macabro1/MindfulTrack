require("dotenv").config();

const os = require('os');
const app = require("./src/app");
const pool = require("./src/config/database");

// Importar worker de notificaciones
const { notificationWorker } = require("./src/queues/notificationQueue");

const PORT = process.env.PORT || 3000;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function iniciarServidor() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Conexión exitosa a MySQL");
        connection.release();

        app.listen(PORT, '0.0.0.0', () => {
            const localIP = getLocalIP();
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`📱 Accesible desde: http://${localIP}:${PORT}`);
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