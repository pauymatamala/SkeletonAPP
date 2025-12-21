import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

/**
 * IL7 EXTENDIDO: Servicio de Plugins Extendidos de Capacitor
 * 
 * Integra plugins adicionales según documentación oficial:
 * - @capacitor/camera (captura de fotos y acceso a galería)
 * - @capacitor/geolocation (ubicación GPS)
 * - @capacitor/share (compartir contenido)
 * - @capacitor/toast (notificaciones toast nativas)
 * 
 * Genera mayor valor a los requerimientos del cliente:
 * ✅ Captura de imágenes para perfiles y contenido
 * ✅ Geolocalización para servicios basados en ubicación
 * ✅ Compartir contenido en redes sociales
 * ✅ Feedback visual nativo con toast
 */
@Injectable({ providedIn: 'root' })
export class ExtendedPluginsService {
  private isNative = false;

  constructor() {
    this.detectPlatform();
  }

  /**
   * Detecta si está ejecutándose en plataforma nativa
   */
  private detectPlatform() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * ============= CAMERA =============
   * Documentación: https://capacitorjs.com/docs/apis/camera
   */

  /**
   * Captura una foto con la cámara
   * @returns Base64 string de la imagen
   */
  async takePicture(): Promise<string | null> {
    if (!this.isNative) {
      console.warn('Camera no disponible en web');
      await this.showToast('Cámara no disponible en navegador web');
      return null;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      await this.showToast('✅ Foto capturada exitosamente');
      return image.base64String || null;
    } catch (err: any) {
      console.error('Error al capturar foto:', err);
      if (err.message !== 'User cancelled photos app') {
        await this.showToast('❌ Error al capturar foto');
      }
      return null;
    }
  }

  /**
   * Selecciona una foto de la galería
   * @returns Base64 string de la imagen
   */
  async pickFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      await this.showToast('✅ Imagen seleccionada');
      return image.base64String || null;
    } catch (err: any) {
      console.error('Error al seleccionar imagen:', err);
      if (err.message !== 'User cancelled photos app') {
        await this.showToast('❌ Error al seleccionar imagen');
      }
      return null;
    }
  }

  /**
   * Obtiene múltiples fotos (Android 13+)
   */
  async pickMultiplePhotos(): Promise<string[]> {
    if (!this.isNative) {
      await this.showToast('Función no disponible en web');
      return [];
    }

    try {
      // Nota: pickImages solo disponible en versiones recientes
      const result = await (Camera as any).pickImages?.({
        quality: 90,
        limit: 5
      });

      if (result?.photos) {
        await this.showToast(`✅ ${result.photos.length} fotos seleccionadas`);
        return result.photos.map((p: any) => p.webPath || '');
      }
      return [];
    } catch (err) {
      console.warn('pickImages no soportado:', err);
      // Fallback a selección única
      const single = await this.pickFromGallery();
      return single ? [single] : [];
    }
  }

  /**
   * ============= GEOLOCATION =============
   * Documentación: https://capacitorjs.com/docs/apis/geolocation
   */

  /**
   * Obtiene la ubicación actual del dispositivo
   */
  async getCurrentPosition(): Promise<Position | null> {
    try {
      // Verificar permisos primero
      const hasPermission = await this.checkGeolocationPermission();
      if (!hasPermission) {
        await this.showToast('❌ Permisos de ubicación denegados');
        return null;
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      await this.showToast('✅ Ubicación obtenida');
      return coordinates;
    } catch (err: any) {
      console.error('Error al obtener ubicación:', err);
      if (err.message.includes('permission')) {
        await this.showToast('❌ Permisos de ubicación requeridos');
      } else {
        await this.showToast('❌ Error al obtener ubicación');
      }
      return null;
    }
  }

  /**
   * Observa los cambios de ubicación en tiempo real
   */
  async watchPosition(callback: (position: Position) => void): Promise<string | null> {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        },
        (position, err) => {
          if (err) {
            console.error('Error watching position:', err);
            return;
          }
          if (position) {
            callback(position);
          }
        }
      );

      return watchId ?? null;
    } catch (err) {
      console.error('Error al iniciar watch position:', err);
      return null;
    }
  }

  /**
   * Detiene la observación de ubicación
   */
  async clearWatch(watchId: string) {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (err) {
      console.error('Error clearing watch:', err);
    }
  }

  /**
   * Verifica permisos de geolocalización
   */
  async checkGeolocationPermission(): Promise<boolean> {
    try {
      const result = await Geolocation.checkPermissions();
      return result.location === 'granted';
    } catch (err) {
      console.error('Error checking permissions:', err);
      return false;
    }
  }

  /**
   * Solicita permisos de geolocalización
   */
  async requestGeolocationPermission(): Promise<boolean> {
    try {
      const result = await Geolocation.requestPermissions();
      return result.location === 'granted';
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  }

  /**
   * ============= SHARE =============
   * Documentación: https://capacitorjs.com/docs/apis/share
   */

  /**
   * Comparte texto simple
   */
  async shareText(text: string, title?: string): Promise<boolean> {
    try {
      await Share.share({
        title: title || 'Compartir',
        text: text,
        dialogTitle: 'Compartir con'
      });
      return true;
    } catch (err) {
      console.error('Error al compartir:', err);
      await this.showToast('❌ Error al compartir');
      return false;
    }
  }

  /**
   * Comparte una URL
   */
  async shareUrl(url: string, title?: string): Promise<boolean> {
    try {
      await Share.share({
        title: title || 'Compartir enlace',
        text: title || 'Mira esto',
        url: url,
        dialogTitle: 'Compartir enlace'
      });
      await this.showToast('✅ Compartido exitosamente');
      return true;
    } catch (err) {
      console.error('Error al compartir URL:', err);
      await this.showToast('❌ Error al compartir');
      return false;
    }
  }

  /**
   * Comparte contenido con archivos (imágenes, etc)
   */
  async shareWithFiles(options: {
    title: string;
    text?: string;
    url?: string;
    files?: string[];
  }): Promise<boolean> {
    try {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        files: options.files,
        dialogTitle: 'Compartir'
      });
      return true;
    } catch (err) {
      console.error('Error al compartir archivos:', err);
      return false;
    }
  }

  /**
   * Verifica si se puede compartir
   */
  async canShare(): Promise<boolean> {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      return false;
    }
  }

  /**
   * ============= TOAST =============
   * Documentación: https://capacitorjs.com/docs/apis/toast
   */

  /**
   * Muestra una notificación toast nativa
   */
  async showToast(
    message: string,
    duration: 'short' | 'long' = 'short',
    position: 'top' | 'center' | 'bottom' = 'bottom'
  ): Promise<void> {
    try {
      await Toast.show({
        text: message,
        duration: duration,
        position: position
      });
    } catch (err) {
      console.error('Error mostrando toast:', err);
      // Fallback a console si falla
      console.log('Toast:', message);
    }
  }

  /**
   * ============= UTILIDADES =============
   */

  /**
   * Formatea coordenadas para mostrar
   */
  formatCoordinates(position: Position): string {
    const lat = position.coords.latitude.toFixed(6);
    const lng = position.coords.longitude.toFixed(6);
    return `${lat}, ${lng}`;
  }

  /**
   * Genera URL de Google Maps
   */
  getGoogleMapsUrl(position: Position): string {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  /**
   * Convierte Base64 a Data URL para mostrar en img
   */
  base64ToDataUrl(base64: string, mimeType: string = 'image/jpeg'): string {
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Obtiene información de plataforma
   */
  getPlatformInfo(): {
    isNative: boolean;
    platform: string;
    canUseCamera: boolean;
    canUseGeolocation: boolean;
    canShare: boolean;
  } {
    return {
      isNative: this.isNative,
      platform: Capacitor.getPlatform(),
      canUseCamera: this.isNative || Capacitor.getPlatform() === 'web',
      canUseGeolocation: true, // Disponible en web también
      canShare: this.isNative
    };
  }
}
