import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/authService';
import SecureStorageService from '../services/secureStorage';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol_id: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStorageService.getAccessToken();
      const savedUser = await SecureStorageService.getUser();

      if (token && savedUser) {
        setUser(savedUser);
        console.log('✅ Sesión restaurada:', savedUser.correo);
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });

    if (response.success && response.data?.user) {
      setUser(response.data.user);
    } else {
      throw new Error(response.message || 'Error al iniciar sesión');
    }
  };

  const register = async (data: any) => {
    await AuthService.register(data);
  };

  const logout = async () => {
    // ============================================
    // CORRECCIÓN: Limpiar el estado del usuario PRIMERO
    // Esto dispara la redirección al login en _layout.tsx
    // ANTES de que las peticiones en curso fallen con 401
    // ============================================
    setUser(null);

    // Luego limpiar tokens y datos locales
    await AuthService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};