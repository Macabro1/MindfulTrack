import * as SecureStore from 'expo-secure-store';

class SecureStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(this.TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, refreshToken)
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
  }

  async saveUser(user: any): Promise<void> {
    await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
  }

  async getUser(): Promise<any | null> {
    const user = await SecureStore.getItemAsync(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(this.TOKEN_KEY),
      SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(this.USER_KEY)
    ]);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }
}

export default new SecureStorageService();