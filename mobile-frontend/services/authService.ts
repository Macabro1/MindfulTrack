import api from './api';
import SecureStorageService from './secureStorage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      nombre: string;
      apellido: string;
      correo: string;
      rol_id: number;
    };
    token: string;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', {
        correo: credentials.email,
        password: credentials.password,
      });

      console.log('📥 Respuesta del login:', JSON.stringify(response.data));

      if (response.data.success && response.data.data) {
        const { token, usuario } = response.data.data;

        // Mapear "usuario" del backend a un formato estándar
        const user = {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          rol_id: usuario.rol_id || usuario.rol || 2,
        };

        await SecureStorageService.saveTokens(token, token);
        await SecureStorageService.saveUser(user);

        console.log('✅ Login exitoso, token guardado');

        return {
          success: true,
          message: response.data.message,
          data: { user, token },
        };
      }

      return {
        success: false,
        message: response.data.message || 'Error al iniciar sesión',
      };
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Error al iniciar sesión'
      );
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.email,
        password: data.password,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error en registro:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Error al registrarse'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await SecureStorageService.clearTokens();

      const DatabaseService = (await import('./database')).default;
      await DatabaseService.clearAllData();

      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      return await SecureStorageService.getUser();
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStorageService.getAccessToken();
      return !!token;
    } catch {
      return false;
    }
  }
}

export default new AuthService();