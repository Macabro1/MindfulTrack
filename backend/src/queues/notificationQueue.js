const { Queue, Worker } = require('bullmq');

// Simulación de conexión (para desarrollo sin Redis)
let connection = null;
let useRedis = false;

try {
    const redis = require('ioredis');
    connection = new redis.Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    });
    useRedis = true;
    console.log('📨 Conectado a Redis para colas de trabajo');
} catch (error) {
    console.warn('⚠️ Redis no disponible, usando simulación en memoria');
}

// Configurar cola de notificaciones
const notificationQueue = useRedis 
    ? new Queue('notifications', { connection })
    : {
        async add(name, data, opts) {
            console.log(`📨 [MEMORY] Tarea encolada: ${name}`, data);
            setTimeout(() => {
                console.log(`📨 [MEMORY] Procesando tarea: ${name}`);
                console.log(`✅ [MEMORY] Tarea completada: ${name}`);
            }, 100);
            return { id: Date.now() };
        }
    };

// Worker para procesar tareas (solo si hay Redis)
let notificationWorker = null;

if (useRedis) {
    notificationWorker = new Worker('notifications', async (job) => {
        const { userId, habitName } = job.data;
        
        console.log(`📨 Procesando notificación para usuario ${userId}`);
        console.log(`📨 Hábito completado: ${habitName}`);
        
        await sendPushNotification(userId, {
            title: '🎉 ¡Hábito completado!',
            body: `Has completado "${habitName}" hoy. ¡Sigue así!`
        });
        
        console.log(`✅ Notificación enviada para usuario ${userId}`);
    }, {
        connection,
        concurrency: 5
    });

    notificationWorker.on('completed', (job) => {
        console.log(`✅ Tarea completada: ${job.id}`);
    });

    notificationWorker.on('failed', (job, err) => {
        console.error(`❌ Tarea falló: ${job.id}`, err);
    });
}

// Función para enviar notificación push (simulada)
async function sendPushNotification(userId, notification) {
    console.log(`📲 Enviando a usuario ${userId}:`, notification);
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
}

module.exports = {
    notificationQueue,
    notificationWorker,
    connection
};