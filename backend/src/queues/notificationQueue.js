// src/queues/notificationQueue.js
// ✅ VERSIÓN SIN REDIS - Usa simulación en memoria

const notificationQueue = {
    async add(name, data, opts) {
        console.log(`📨 [SIMULACIÓN] Tarea encolada: ${name}`, data);
        
        // Simular procesamiento asíncrono
        setTimeout(async () => {
            console.log(`📨 [SIMULACIÓN] Procesando tarea: ${name}`);
            console.log(`📨 [SIMULACIÓN] Datos:`, data);
            
            // Simular envío de notificación
            await sendPushNotification(data.userId, {
                title: '🎉 ¡Hábito completado!',
                body: `Has completado "${data.habitName}" hoy. ¡Sigue así!`
            });
            
            console.log(`✅ [SIMULACIÓN] Tarea completada: ${name}`);
        }, 100);
        
        return { id: Date.now() };
    }
};

// Worker simulado (siempre disponible)
const notificationWorker = {
    on: () => {},
    close: () => {}
};

// Función para enviar notificación push (simulada)
async function sendPushNotification(userId, notification) {
    console.log(`📲 [SIMULACIÓN] Enviando a usuario ${userId}:`, notification);
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
}

module.exports = {
    notificationQueue,
    notificationWorker,
    connection: null
};