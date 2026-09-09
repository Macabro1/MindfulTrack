// ============================================
// MODELO: User (Usuario)
// ============================================
export interface User {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Serialización: Servidor → Cliente
export const userFromServer = (data: any): User => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role || 'user',
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
  };
};

// Serialización: Cliente → Servidor
export const userToServer = (user: Partial<User>): any => {
  const result: any = {};
  if (user.name) result.name = user.name;
  if (user.email) result.email = user.email;
  if (user.avatar) result.avatar = user.avatar;
  if (user.role) result.role = user.role;
  return result;
};