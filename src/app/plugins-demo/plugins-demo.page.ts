import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExtendedPluginsService } from '../core/extended-plugins.service';
import { CapacitorPluginsService } from '../core/capacitor-plugins.service';
import { Position } from '@capacitor/geolocation';

/**
 * IL7: Página de Demostración de Plugins
 * 
 * Demuestra la integración de múltiples plugins de Capacitor:
 * ✅ Camera: Captura y galería de fotos
 * ✅ Geolocation: Ubicación GPS en tiempo real
 * ✅ Share: Compartir contenido
 * ✅ Toast: Notificaciones nativas
 * ✅ Haptics: Feedback háptico
 * ✅ StatusBar: Control de barra de estado
 * 
 * Genera MAYOR VALOR al cliente mostrando capacidades nativas
 */
@Component({
  selector: 'app-plugins-demo',
  templateUrl: './plugins-demo.page.html',
  styleUrls: ['./plugins-demo.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PluginsDemoPage implements OnInit, OnDestroy {
  // Tab activo
  activeTab: 'camera' | 'location' | 'share' | 'haptics' = 'camera';

  // Camera
  capturedImage: string | null = null;
  photoGallery: string[] = [];

  // Geolocation
  currentPosition: Position | null = null;
  isWatchingLocation = false;
  locationHistory: Position[] = [];
  private watchId: string | null = null;

  // Platform info
  platformInfo = this.extendedPlugins.getPlatformInfo();

  // Stats
  stats = {
    photoCaptured: 0,
    locationsObtained: 0,
    sharesCompleted: 0,
    hapticsFeedback: 0
  };

  constructor(
    public extendedPlugins: ExtendedPluginsService,
    private capacitorPlugins: CapacitorPluginsService
  ) {}

  ngOnInit() {
    this.loadStats();
    // Vibración de bienvenida
    this.capacitorPlugins.hapticImpactLight();
  }

  ngOnDestroy() {
    if (this.watchId) {
      this.extendedPlugins.clearWatch(this.watchId);
    }
  }

  /**
   * ============= CAMERA =============
   */

  async takePicture() {
    await this.capacitorPlugins.hapticImpactMedium();
    const base64 = await this.extendedPlugins.takePicture();
    
    if (base64) {
      this.capturedImage = this.extendedPlugins.base64ToDataUrl(base64);
      this.photoGallery.unshift(this.capturedImage);
      this.stats.photoCaptured++;
      this.saveStats();
    }
  }

  async pickFromGallery() {
    await this.capacitorPlugins.hapticImpactLight();
    const base64 = await this.extendedPlugins.pickFromGallery();
    
    if (base64) {
      this.capturedImage = this.extendedPlugins.base64ToDataUrl(base64);
      this.photoGallery.unshift(this.capturedImage);
      this.stats.photoCaptured++;
      this.saveStats();
    }
  }

  async pickMultiple() {
    await this.capacitorPlugins.hapticImpactMedium();
    const photos = await this.extendedPlugins.pickMultiplePhotos();
    
    if (photos.length > 0) {
      this.photoGallery = [...photos, ...this.photoGallery];
      this.capturedImage = photos[0];
      this.stats.photoCaptured += photos.length;
      this.saveStats();
    }
  }

  clearGallery() {
    this.photoGallery = [];
    this.capturedImage = null;
    this.capacitorPlugins.hapticNotificationSuccess();
    this.extendedPlugins.showToast('Galería limpiada');
  }

  /**
   * ============= GEOLOCATION =============
   */

  async getCurrentLocation() {
    await this.capacitorPlugins.hapticImpactMedium();
    await this.extendedPlugins.showToast('Obteniendo ubicación...', 'short', 'top');
    
    const position = await this.extendedPlugins.getCurrentPosition();
    
    if (position) {
      this.currentPosition = position;
      this.locationHistory.unshift(position);
      this.stats.locationsObtained++;
      this.saveStats();
      await this.capacitorPlugins.hapticNotificationSuccess();
    }
  }

  async toggleWatchLocation() {
    if (this.isWatchingLocation) {
      // Detener observación
      if (this.watchId) {
        await this.extendedPlugins.clearWatch(this.watchId);
        this.watchId = null;
      }
      this.isWatchingLocation = false;
      await this.extendedPlugins.showToast('Monitoreo detenido');
      await this.capacitorPlugins.hapticNotificationWarning();
    } else {
      // Iniciar observación
      await this.capacitorPlugins.hapticImpactMedium();
      const hasPermission = await this.extendedPlugins.checkGeolocationPermission();
      
      if (!hasPermission) {
        const granted = await this.extendedPlugins.requestGeolocationPermission();
        if (!granted) {
          await this.extendedPlugins.showToast('Permisos denegados');
          return;
        }
      }

      this.watchId = await this.extendedPlugins.watchPosition((position) => {
        this.currentPosition = position;
        this.locationHistory.unshift(position);
        if (this.locationHistory.length > 10) {
          this.locationHistory = this.locationHistory.slice(0, 10);
        }
        this.stats.locationsObtained++;
        this.saveStats();
      });

      if (this.watchId) {
        this.isWatchingLocation = true;
        await this.extendedPlugins.showToast('Monitoreando ubicación');
        await this.capacitorPlugins.hapticNotificationSuccess();
      }
    }
  }

  openInMaps() {
    if (this.currentPosition) {
      const url = this.extendedPlugins.getGoogleMapsUrl(this.currentPosition);
      window.open(url, '_blank');
      this.capacitorPlugins.hapticImpactLight();
    }
  }

  clearLocationHistory() {
    this.locationHistory = [];
    this.currentPosition = null;
    this.extendedPlugins.showToast('Historial limpiado');
    this.capacitorPlugins.hapticNotificationSuccess();
  }

  /**
   * ============= SHARE =============
   */

  async shareApp() {
    await this.capacitorPlugins.hapticImpactMedium();
    const success = await this.extendedPlugins.shareText(
      '¡Mira esta increíble app! Tiene integración nativa con Camera, GPS, Share y más 🚀',
      'SkeletonAPP - Demo de Plugins'
    );
    
    if (success) {
      this.stats.sharesCompleted++;
      this.saveStats();
      await this.capacitorPlugins.hapticNotificationSuccess();
    }
  }

  async shareLocation() {
    if (!this.currentPosition) {
      await this.extendedPlugins.showToast('Obtén tu ubicación primero');
      return;
    }

    await this.capacitorPlugins.hapticImpactMedium();
    const coords = this.extendedPlugins.formatCoordinates(this.currentPosition);
    const mapsUrl = this.extendedPlugins.getGoogleMapsUrl(this.currentPosition);
    
    const success = await this.extendedPlugins.shareUrl(
      mapsUrl,
      `Mi ubicación: ${coords}`
    );
    
    if (success) {
      this.stats.sharesCompleted++;
      this.saveStats();
    }
  }

  async sharePhoto() {
    if (!this.capturedImage) {
      await this.extendedPlugins.showToast('Captura una foto primero');
      return;
    }

    await this.capacitorPlugins.hapticImpactMedium();
    const success = await this.extendedPlugins.shareText(
      'Mira esta foto que capturé con mi app 📸',
      'Foto desde SkeletonAPP'
    );
    
    if (success) {
      this.stats.sharesCompleted++;
      this.saveStats();
    }
  }

  async shareStats() {
    await this.capacitorPlugins.hapticImpactMedium();
    const text = `📊 Mis estadísticas en SkeletonAPP:\n` +
      `📸 Fotos capturadas: ${this.stats.photoCaptured}\n` +
      `📍 Ubicaciones obtenidas: ${this.stats.locationsObtained}\n` +
      `🔄 Veces compartido: ${this.stats.sharesCompleted}\n` +
      `📳 Feedback háptico: ${this.stats.hapticsFeedback}`;
    
    await this.extendedPlugins.shareText(text, 'Mis estadísticas');
  }

  /**
   * ============= HAPTICS =============
   */

  async testHapticLight() {
    await this.capacitorPlugins.hapticImpactLight();
    await this.extendedPlugins.showToast('Impacto ligero', 'short', 'bottom');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testHapticMedium() {
    await this.capacitorPlugins.hapticImpactMedium();
    await this.extendedPlugins.showToast('Impacto medio', 'short', 'bottom');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testHapticHeavy() {
    await this.capacitorPlugins.hapticImpactHeavy();
    await this.extendedPlugins.showToast('Impacto fuerte', 'short', 'bottom');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testHapticSuccess() {
    await this.capacitorPlugins.hapticNotificationSuccess();
    await this.extendedPlugins.showToast('✅ Notificación: Éxito', 'short', 'top');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testHapticWarning() {
    await this.capacitorPlugins.hapticNotificationWarning();
    await this.extendedPlugins.showToast('⚠️ Notificación: Advertencia', 'short', 'center');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testHapticError() {
    await this.capacitorPlugins.hapticNotificationError();
    await this.extendedPlugins.showToast('❌ Notificación: Error', 'short', 'bottom');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testVibrationPattern() {
    await this.capacitorPlugins.vibratePattern([100, 50, 100, 50, 200]);
    await this.extendedPlugins.showToast('Patrón de vibración ejecutado');
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  async testSelectionChanged() {
    await this.capacitorPlugins.hapticSelection();
    this.stats.hapticsFeedback++;
    this.saveStats();
  }

  /**
   * ============= UI HELPERS =============
   */

  setActiveTab(tab: 'camera' | 'location' | 'share' | 'haptics') {
    this.activeTab = tab;
    this.capacitorPlugins.hapticSelection();
  }

  formatCoordinates(position: Position): string {
    return this.extendedPlugins.formatCoordinates(position);
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatAccuracy(accuracy: number | null | undefined): string {
    if (!accuracy) return 'N/A';
    return `±${accuracy.toFixed(0)}m`;
  }

  /**
   * ============= PERSISTENCIA =============
   */

  private saveStats() {
    localStorage.setItem('plugins-demo-stats', JSON.stringify(this.stats));
  }

  private loadStats() {
    const saved = localStorage.getItem('plugins-demo-stats');
    if (saved) {
      try {
        this.stats = JSON.parse(saved);
      } catch {
        // Usar stats por defecto
      }
    }
  }

  resetStats() {
    this.stats = {
      photoCaptured: 0,
      locationsObtained: 0,
      sharesCompleted: 0,
      hapticsFeedback: 0
    };
    this.saveStats();
    this.extendedPlugins.showToast('Estadísticas reiniciadas');
    this.capacitorPlugins.hapticNotificationSuccess();
  }
}
