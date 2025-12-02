import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class GlobalErrorService {
  constructor(private toastCtrl: ToastController) {}

  async presentError(message: string) {
    try {
      const t = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await t.present();
    } catch (e) {
      console.error('Failed to present toast', e);
    }
  }

  /** Centraliza manejo de errores: muestra toast y retorna el mensaje o rethrow */
  async handleError(err: any) {
    const msg = err?.message || err?.error?.message || 'Error en la conexión';
    await this.presentError(String(msg));
  }
}
