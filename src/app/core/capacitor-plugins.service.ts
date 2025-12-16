import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';

/**
 * IL7: Servicio de plugins de Capacitor
 * 
 * Integra múltiples plugins de Capacitor según documentación oficial:
 * - @capacitor/haptics (vibración y feedback háptico)
 * - @capacitor/status-bar (control de barra de estado)
 * - @capacitor/app (información y eventos de app)
 * - @capacitor/keyboard (control del teclado virtual)
 * - @capacitor-community/sqlite (persistencia de datos)
 * 
 * Proporciona una interfaz unificada para acceder a las capacidades nativas
 */
@Injectable({ providedIn: 'root' })
export class CapacitorPluginsService {
  private isNative = false;

  constructor() {
    this.detectPlatform();
  }

  /**
   * Detecta si está ejecutándose en plataforma nativa
   */
  private detectPlatform() {
    const platform = this.getPlatformName();
    this.isNative = platform === 'ios' || platform === 'android';
  }

  /**
   * Obtiene el nombre de la plataforma actual
   */
  getPlatformName(): string {
    try {
      // En Capacitor v7+
      return (window as any)['Capacitor']?.Plugins?.Device?.getInfo?.() || 'web';
    } catch {
      return 'web';
    }
  }

  /**
   * ============= HAPTICS (Vibración y Feedback) =============
   * Documentación: https://capacitorjs.com/docs/apis/haptics
   */

  /**
   * Vibración simple
   */
  async vibrateSimple() {
    if (!this.isNative) return;
    try {
      await Haptics.vibrate({ duration: 100 });
    } catch (err) {
      console.warn('Error en vibración', err);
    }
  }

  /**
   * Vibración con patrón (múltiples pulsos)
   */
  async vibratePattern(pattern: number[] = [30, 40, 30, 40, 30]) {
    if (!this.isNative) return;
    try {
      for (const duration of pattern) {
        await Haptics.vibrate({ duration });
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    } catch (err) {
      console.warn('Error en vibración con patrón', err);
    }
  }

  /**
   * Feedback háptico de impacto suave
   */
  async hapticImpactLight() {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (err) {
      console.warn('Error en impacto ligero', err);
    }
  }

  /**
   * Feedback háptico de impacto medio
   */
  async hapticImpactMedium() {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (err) {
      console.warn('Error en impacto medio', err);
    }
  }

  /**
   * Feedback háptico de impacto fuerte
   */
  async hapticImpactHeavy() {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (err) {
      console.warn('Error en impacto fuerte', err);
    }
  }

  /**
   * Feedback háptico de selección
   */
  async hapticSelection() {
    if (!this.isNative) return;
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (err) {
      console.warn('Error en feedback de selección', err);
    }
  }

  /**
   * Notificación háptica de éxito
   */
  async hapticNotificationSuccess() {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (err) {
      console.warn('Error en notificación de éxito', err);
    }
  }

  /**
   * Notificación háptica de advertencia
   */
  async hapticNotificationWarning() {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (err) {
      console.warn('Error en notificación de advertencia', err);
    }
  }

  /**
   * Notificación háptica de error
   */
  async hapticNotificationError() {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (err) {
      console.warn('Error en notificación de error', err);
    }
  }

  /**
   * ============= STATUS BAR (Barra de Estado) =============
   * Documentación: https://capacitorjs.com/docs/apis/status-bar
   */

  /**
   * Establece el color de fondo de la barra de estado
   */
  async setStatusBarColor(color: string) {
    if (!this.isNative) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (err) {
      console.warn('Error al cambiar color de barra de estado', err);
    }
  }

  /**
   * Establece el estilo de la barra de estado (luz/oscuro)
   */
  async setStatusBarStyle(style: 'light' | 'dark') {
    if (!this.isNative) return;
    try {
      const capacitorStyle = style === 'light' ? Style.Light : Style.Dark;
      await StatusBar.setStyle({ style: capacitorStyle });
    } catch (err) {
      console.warn('Error al cambiar estilo de barra de estado', err);
    }
  }

  /**
   * Muestra/oculta la barra de estado
   */
  async showStatusBar(show: boolean) {
    if (!this.isNative) return;
    try {
      if (show) {
        await StatusBar.show();
      } else {
        await StatusBar.hide();
      }
    } catch (err) {
      console.warn('Error al cambiar visibilidad de barra de estado', err);
    }
  }

  /**
   * ============= KEYBOARD (Teclado Virtual) =============
   * Documentación: https://capacitorjs.com/docs/apis/keyboard
   */

  /**
   * Oculta el teclado virtual
   */
  async hideKeyboard() {
    if (!this.isNative) return;
    try {
      await Keyboard.hide();
    } catch (err) {
      console.warn('Error al ocultar teclado', err);
    }
  }

  /**
   * Muestra el teclado virtual
   */
  async showKeyboard() {
    if (!this.isNative) return;
    try {
      await Keyboard.show();
    } catch (err) {
      console.warn('Error al mostrar teclado', err);
    }
  }

  /**
   * ============= APP (Información de la Aplicación) =============
   * Documentación: https://capacitorjs.com/docs/apis/app
   */

  /**
   * Obtiene información de la aplicación
   */
  async getAppInfo() {
    try {
      const info = await App.getInfo();
      return {
        id: info.id,
        name: info.name,
        version: info.version,
        build: info.build
      };
    } catch (err) {
      console.warn('Error al obtener información de la app', err);
      return null;
    }
  }

  /**
   * Cierra la aplicación
   */
  async exitApp() {
    try {
      await App.exitApp();
    } catch (err) {
      console.warn('Error al cerrar aplicación', err);
    }
  }

  /**
   * Minimiza la aplicación
   */
  async minimizeApp() {
    if (!this.isNative) return;
    try {
      // En Android se puede usar exitApp para minimizar
      // En iOS no hay método directo, se usa el gesto de inicio
      console.warn('Minimizar app no está soportado en todas las plataformas');
    } catch (err) {
      console.warn('Error al minimizar aplicación', err);
    }
  }

  /**
   * Obtiene el URL de la aplicación al abrirse desde un deeplink
   */
  async getAppLaunchUrl(): Promise<string | null> {
    try {
      const result = await App.getLaunchUrl();
      return result?.url || null;
    } catch (err) {
      console.warn('Error al obtener URL de lanzamiento', err);
      return null;
    }
  }

  /**
   * ============= UTILIDADES COMBINADAS =============
   */

  /**
   * Feedback visual + háptico para acción exitosa
   */
  async feedbackSuccess() {
    await this.hapticNotificationSuccess();
  }

  /**
   * Feedback visual + háptico para acción fallida
   */
  async feedbackError() {
    await this.hapticNotificationError();
  }

  /**
   * Feedback visual + háptico para advertencia
   */
  async feedbackWarning() {
    await this.hapticNotificationWarning();
  }

  /**
   * Feedback para click de botón
   */
  async feedbackButtonClick() {
    await this.hapticImpactLight();
  }

  /**
   * Configura el tema de la app (luz/oscuro) junto con barra de estado
   */
  async setAppTheme(theme: 'light' | 'dark') {
    if (!this.isNative) return;
    try {
      const color = theme === 'light' ? '#FFFFFF' : '#1a1a1a';
      await this.setStatusBarColor(color);
      await this.setStatusBarStyle(theme);
    } catch (err) {
      console.warn('Error al establecer tema de la app', err);
    }
  }

  /**
   * Obtiene si está en plataforma nativa
   */
  isNativePlatform(): boolean {
    return this.isNative;
  }
}
