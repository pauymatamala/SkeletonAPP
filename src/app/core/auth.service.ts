import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SecureStorageService } from './secure-storage.service';

/**
 * Servicio de autenticación: manejo de access/refresh tokens.
 * - Guarda tokens en `SecureStorageService`.
 * - Provee `getAccessToken()` y `refreshToken()`.
 * Nota: Para que `refreshToken()` funcione, configura `environment.apiUrl` y
 * añade un endpoint `/auth/refresh` o modifica la ruta usada abajo.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private ACCESS_KEY = 'access_token';
  private REFRESH_KEY = 'refresh_token';

  constructor(private storage: SecureStorageService, private api: ApiService) {}

  async setAccessToken(token: string) {
    await this.storage.set(this.ACCESS_KEY, token);
  }

  async getAccessToken(): Promise<string | null> {
    return await this.storage.get(this.ACCESS_KEY);
  }

  async setRefreshToken(token: string) {
    await this.storage.set(this.REFRESH_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.storage.get(this.REFRESH_KEY);
  }

  async clearTokens() {
    await this.storage.remove(this.ACCESS_KEY);
    await this.storage.remove(this.REFRESH_KEY);
  }

  /**
   * Intento de refresh: llama al endpoint `/auth/refresh` con el refresh token.
   * Devuelve el nuevo access token o null si falla.
   * Ajusta esta implementación según el contrato del API (nombre del campo, ruta).
   */
  async refreshToken(): Promise<string | null> {
    const refresh = await this.getRefreshToken();
    if (!refresh) return null;
    try {
      // Cambia la ruta si tu API usa otra
      const res: any = await this.api.post<any, any>('auth/refresh', { refresh_token: refresh }).toPromise();
      const newAccess = res?.access_token || res?.token || null;
      const newRefresh = res?.refresh_token || null;
      if (newAccess) {
        await this.setAccessToken(newAccess);
      }
      if (newRefresh) {
        await this.setRefreshToken(newRefresh);
      }
      return newAccess;
    } catch (e) {
      console.warn('refreshToken failed', e);
      await this.clearTokens();
      return null;
    }
  }
}
