import axios from 'axios';
import { Platform } from 'react-native';
import SecureStorageService from './secureStorage';

// ============================================
// 1. CONFIGURACIÓN POR AMBIENTE
// ============================================
const ENV = {
  development: {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.2:3000',
    TIMEOUT: 30000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
    LOG_LEVEL: 'debug',
  },
  production: {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.mindfultrack.com',
    TIMEOUT: 15000,
    RETRY_COUNT: 2,
    RETRY_DELAY: 500,
    LOG_LEVEL: 'error',
  },
  test: {
    API_URL: 'http://localhost:3000',
    TIMEOUT: 5000,
    RETRY_COUNT: 1,
    RETRY_DELAY: 100,
    LOG_LEVEL: 'debug',
  },
};

// Determinar el ambiente actual
const getEnvironment = () => {
  if (__DEV__) return 'development';
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

const currentEnv = getEnvironment();
const config = ENV[currentEnv];

// ============================================
// 2. CLIENTE HTTP ÚNICO
// ============================================
const api = axios.create({
  baseURL: `${config.API_URL}/api`,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // En producción: exigir HTTPS
  ...(currentEnv === 'production' && {
    httpsAgent: true,
  }),
});

// ============================================
// 3. INTERCEPTOR DE AUTENTICACIÓN (INYECCIÓN DE TOKEN)
// ============================================
api.interceptors.request.use(
  async (request) => {
    try {
      const token = await SecureStorageService.getAccessToken();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      
      // Logging: solo en desarrollo
      if (currentEnv !== 'production') {
        console.log(`📤 ${request.method?.toUpperCase()} ${request.url}`);
        if (request.data) {
          console.log('📦 Body:', request.data);
        }
      }
      
      return request;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return request;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// 4. INTERCEPTOR DE RENOVACIÓN AUTOMÁTICA DE TOKEN
// ============================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Logging en desarrollo
    if (currentEnv !== 'production') {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Evitar bucles infinitos
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Verificar si es un error 401 y NO es una petición de login/refresh
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      
      // Si ya se está renovando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Obtener refresh token
        const refreshToken = await SecureStorageService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }
        
        console.log('🔄 Renovando token...');
        
        // Llamar al endpoint de refresh
        const response = await axios.post(
          `${config.API_URL}/api/auth/refresh`,
          { refreshToken },
          { timeout: 5000 }
        );
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Guardar nuevos tokens
        await SecureStorageService.saveTokens(token, newRefreshToken);
        
        console.log('✅ Token renovado exitosamente');
        
        // Procesar cola con el nuevo token
        processQueue(null, token);
        isRefreshing = false;
        
        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError);
        
        // Si falla la renovación, limpiar tokens
        await SecureStorageService.clearTokens();
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Notificar que se requiere login nuevamente
        // (El componente de navegación manejará esto)
        return Promise.reject({
          ...refreshError,
          forceLogout: true,
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// 5. TRADUCCIÓN DE ERRORES (4 FAMILIAS)
// ============================================
export const translateError = (error: any): string => {
  // 1. Error de red (sin conexión)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return '⏱️ El servidor no responde. Intenta más tarde.';
    }
    if (!navigator.onLine) {
      return '📡 No hay conexión a internet. Verifica tu red.';
    }
    return '🌐 Error de red. Verifica tu conexión.';
  }
  
  const { status, data } = error.response;
  
  // 2. Errores del cliente (4xx)
  switch (status) {
    case 400:
      return '📝 Solicitud incorrecta. Verifica los datos enviados.';
    
    case 401:
      return '🔒 Tu sesión ha expirado. Inicia sesión nuevamente.';
    
    case 403:
      return '🚫 No tienes permiso para realizar esta acción.';
    
    case 404:
      return '🔍 El recurso solicitado no existe.';
    
    case 422:
      // 3. Errores de validación - se asocian a campos específicos
      if (data.errors) {
        const fields = Object.keys(data.errors).join(', ');
        return `✏️ Errores de validación en: ${fields}`;
      }
      return '✏️ Datos inválidos. Verifica los campos.';
    
    case 429:
      return '⏳ Demasiadas peticiones. Espera un momento.';
    
    // 4. Errores del servidor (5xx)
    case 500:
      return '💥 Error interno del servidor. Intenta más tarde.';
    
    case 502:
    case 503:
      return '🔧 Servicio no disponible. Intenta más tarde.';
    
    case 504:
      return '⏱️ Tiempo de espera agotado. El servidor no responde.';
    
    default:
      return `⚠️ Error inesperado (${status}). Contacta al soporte.`;
  }
};

// ============================================
// 6. VERIFICACIÓN DE SEGURIDAD
// ============================================
const verifySecurity = () => {
  console.log('🔍 Verificando seguridad...');
  
  // Verificar que no hay claves en el código
  const source = api.toString();
  const sensitivePatterns = [
    /['"]sk_live_/i,
    /['"]pk_live_/i,
    /['"]secret_/i,
    /['"]key_/i,
    /['"]password['"]?\s*[:=]/i,
  ];
  
  let hasSensitiveData = false;
  for (const pattern of sensitivePatterns) {
    if (pattern.test(source)) {
      hasSensitiveData = true;
      console.warn('⚠️ Posible clave sensible encontrada en el código');
    }
  }
  
  if (!hasSensitiveData) {
    console.log('✅ No se encontraron claves sensibles en el código');
  }
  
  // Verificar HTTPS en producción
  if (currentEnv === 'production') {
    const url = config.API_URL;
    if (!url.startsWith('https://')) {
      console.warn('⚠️ La API en producción no usa HTTPS');
    } else {
      console.log('✅ HTTPS configurado correctamente');
    }
  }
  
  // Verificar logging
  if (currentEnv === 'production') {
    console.log('✅ Logging detallado desactivado en producción');
  }
};

// Ejecutar verificación solo en desarrollo
if (__DEV__) {
  verifySecurity();
}

// ============================================
// 7. FUNCIÓN PARA REINTENTOS (SOLO IDEMPOTENTES)
// ============================================
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = config.RETRY_COUNT,
  delay: number = config.RETRY_DELAY,
  isIdempotent: boolean = true
): Promise<T> => {
  if (!isIdempotent) {
    // Las operaciones no idempotentes (POST) no se reintentan automáticamente
    return fn();
  }
  
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`🔄 Reintento ${attempt}/${maxRetries}...`);
      if (attempt < maxRetries) {
        // Backoff exponencial: 1s, 2s, 4s
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  throw lastError;
};

export { api, config, currentEnv };
export default api;