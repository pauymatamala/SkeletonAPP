import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;
  private _isInitialized = false;

  constructor(private storage: Storage) {}

  async init() {
    if (!this._isInitialized) {
      console.log('StorageService: Initializing...');
      this._storage = await this.storage.create();
      this._isInitialized = true;
      console.log('StorageService: Initialized with driver:', await this._storage?.driver);
    }
  }

  async set(key: string, value: any) {
    await this.init();
    console.log(`StorageService: Setting key "${key}" with value:`, value);
    const result = await this._storage?.set(key, value);
    console.log(`StorageService: Set complete for key "${key}"`);
    return result;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    const v = await this._storage?.get(key);
    console.log(`StorageService: Got key "${key}":`, v);
    return (v as T) ?? null;
  }

  async remove(key: string) {
    await this.init();
    return this._storage?.remove(key);
  }

  async clear() {
    await this.init();
    return this._storage?.clear();
  }

  async keys(): Promise<string[]> {
    await this.init();
    return (await this._storage?.keys()) || [];
  }
}
