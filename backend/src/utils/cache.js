// src/utils/cache.js
const NodeCache = require('node-cache');

// Configuración de caché
const cache = new NodeCache({
    stdTTL: 300,        // Tiempo de vida: 5 minutos
    checkperiod: 60,    // Verificar expiración cada 60 segundos
    useClones: false    // Mejor rendimiento
});

/**
 * Estrategia Cache-Aside
 * @param {string} key - Clave para la caché
 * @param {number} ttl - Tiempo de vida en segundos
 * @param {Function} fetchFunction - Función para obtener datos frescos
 * @returns {Promise<any>} Datos desde caché o base de datos
 */
const cacheAside = async (key, ttl, fetchFunction) => {
    // 1. Intentar obtener de caché
    const cachedData = cache.get(key);
    if (cachedData) {
        console.log(`✅ Cache hit: ${key}`);
        return cachedData;
    }

    // 2. No está en caché → consultar origen
    console.log(`❌ Cache miss: ${key}`);
    const data = await fetchFunction();

    // 3. Almacenar en caché
    if (data) {
        cache.set(key, data, ttl || 300);
        console.log(`💾 Cache set: ${key}`);
    }

    return data;
};

/**
 * Invalidar caché por patrón de clave
 * @param {string} keyPattern - Patrón para buscar claves (ej: "habits:1")
 */
const invalidateCache = (keyPattern) => {
    const keys = cache.keys();
    const filteredKeys = keys.filter(key => key.includes(keyPattern));
    
    if (filteredKeys.length === 0) {
        console.log(`ℹ️ No hay claves para invalidar con patrón: ${keyPattern}`);
        return;
    }
    
    filteredKeys.forEach(key => cache.del(key));
    console.log(`🗑️ Cache invalidated: ${filteredKeys.length} keys (${keyPattern})`);
};

/**
 * Limpiar toda la caché
 */
const clearCache = () => {
    cache.flushAll();
    console.log('🗑️ All cache cleared');
};

module.exports = {
    cache,
    cacheAside,
    invalidateCache,
    clearCache
};