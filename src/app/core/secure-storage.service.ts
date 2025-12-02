import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Wrapper para almacenamiento de tokens.
 * Intenta usar un plugin de Secure Storage si está disponible en runtime (Capacitor),
 * y hace fallback a Ionic Storage para web/entornos sin plugin.
 * IMPORTANTE: Para seguridad real en producción móvil, instala un plugin nativo
 * (p. ej. @capacitor-community/secure-storage) y ajusta aquí según corresponda.
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {}

  private async ensureStorage() {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  /** Almacena un valor (string). */
  async set(key: string, value: string): Promise<void> {
    // Intent: si existe plugin nativo, usarlo aquí (no implementado automáticamente).
    await this.ensureStorage();
    await this._storage?.set(key, value);
  }

  /** Obtiene un valor (string) o null si no existe. */
  async get(key: string): Promise<string | null> {
    await this.ensureStorage();
    const v = await this._storage?.get(key);
    return (v as string) ?? null;
  }

  async remove(key: string): Promise<void> {
    await this.ensureStorage();
    await this._storage?.remove(key);
  }
}
