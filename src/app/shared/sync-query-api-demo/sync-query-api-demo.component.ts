import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SyncQueryApiService } from '../core/sync-query-api.service';
import { Game } from '../models/game.model';

/**
 * Componente de Demostración: SyncQueryApiDemo
 * 
 * Demuestra la solución de consultas síncronas conectadas a API
 * que entrega mejor valor a los requerimientos del cliente:
 * 
 * REQUERIMIENTOS DEL CLIENTE:
 * 1. UI responsiva sin esperas (< 1ms por consulta)
 * 2. Datos siempre frescos (actualizados automáticamente desde API)
 * 3. Búsquedas instantáneas en millones de registros
 * 4. Funcionalidad offline transparente
 * 5. Sincronización en background sin bloquear UI
 * 
 * SOLUCIÓN IMPLEMENTADA:
 * ✅ Caché sincrónico en memoria
 * ✅ Actualización automática cada 5 minutos
 * ✅ Búsqueda O(n) ultra-rápida en caché
 * ✅ Debounce de 5s para evitar sobrecargar API
 * ✅ Persistencia en localStorage
 * ✅ Estadísticas de performance
 * ✅ Manejo de errores transparente
 */
@Component({
  selector: 'app-sync-query-api-demo',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Consultas Síncronas con API</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- ESTADO DE SINCRONIZACIÓN -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Estado de Sincronización</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="status-row">
            <span>Sincronizando:</span>
            <ion-chip *ngIf="isSyncing$ | async as syncing">
              <ion-label>{{ syncing ? '🔄 En progreso...' : '✅ Completado' }}</ion-label>
            </ion-chip>
          </div>

          <div class="status-row">
            <span>Última sincronización:</span>
            <ion-chip *ngIf="lastSyncTime$ | async as time">
              <ion-label>{{ time ? (time | date: 'short') : 'Nunca' }}</ion-label>
            </ion-chip>
          </div>

          <div class="status-row" *ngIf="syncError$ | async as error">
            <ion-chip color="danger" *ngIf="error">
              <ion-label>⚠️ {{ error }}</ion-label>
            </ion-chip>
          </div>

          <ion-button expand="block" (click)="forceSync()" [disabled]="isSyncing$ | async">
            <ion-icon slot="start" name="refresh"></ion-icon>
            Sincronizar Ahora
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- BÚSQUEDA SÍNCRONA -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Búsqueda Síncrona (< 1ms)</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-searchbar
            [(ngModel)]="searchQuery"
            (ionInput)="onSearch($event)"
            placeholder="Buscar juegos..."
          ></ion-searchbar>

          <ion-text color="medium">
            <p>Resultados: {{ searchResults.length }} juegos encontrados</p>
            <p *ngIf="lastSearchTime">Tiempo de búsqueda: {{ lastSearchTime }}ms</p>
          </ion-text>

          <ion-list>
            <ion-item *ngFor="let game of searchResults.slice(0, 10)">
              <ion-label>
                <h2>{{ game.name || game.title }}</h2>
                <p>{{ game.description }}</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <ion-text color="medium" *ngIf="searchResults.length > 10">
            <p class="ion-text-center">... y {{ searchResults.length - 10 }} más</p>
          </ion-text>
        </ion-card-content>
      </ion-card>

      <!-- FILTROS SÍNCRONOS -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Filtros Síncronos</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Por Dificultad:</ion-label>
              <ion-select
                [(ngModel)]="selectedDifficulty"
                (ionChange)="filterByDifficulty($event)"
              >
                <ion-select-option value="">Todos</ion-select-option>
                <ion-select-option value="Easy">Fácil</ion-select-option>
                <ion-select-option value="Medium">Medio</ion-select-option>
                <ion-select-option value="Hard">Difícil</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <ion-text color="medium">
            <p>Juegos encontrados: {{ filteredByDifficulty.length }}</p>
          </ion-text>

          <ion-list>
            <ion-item *ngFor="let game of filteredByDifficulty.slice(0, 5)">
              <ion-label>
                <h2>{{ game.name || game.title }}</h2>
                <p>Dificultad: {{ game.difficulty }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- ESTADÍSTICAS DE PERFORMANCE -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Estadísticas de Performance</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col>
                <div class="stat">
                  <div class="stat-label">Total de Juegos</div>
                  <div class="stat-value">{{ totalGames }}</div>
                </div>
              </ion-col>
              <ion-col>
                <div class="stat">
                  <div class="stat-label">Total de Categorías</div>
                  <div class="stat-value">{{ totalCategories }}</div>
                </div>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <div class="stat">
                  <div class="stat-label">Solicitudes de Sync</div>
                  <div class="stat-value">{{ performanceStats?.totalSyncRequests }}</div>
                </div>
              </ion-col>
              <ion-col>
                <div class="stat">
                  <div class="stat-label">Errores de Sync</div>
                  <div class="stat-value" [style.color]="performanceStats?.totalSyncErrors > 0 ? 'red' : 'green'">
                    {{ performanceStats?.totalSyncErrors }}
                  </div>
                </div>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <div class="stat">
                  <div class="stat-label">Última Sync (ms)</div>
                  <div class="stat-value">{{ performanceStats?.lastSyncDuration }}</div>
                </div>
              </ion-col>
              <ion-col>
                <div class="stat">
                  <div class="stat-label">Hit Rate</div>
                  <div class="stat-value">{{ (performanceStats?.hitRate || 0 | number: '1.0-0') }}%</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>

          <ion-button expand="block" color="secondary" (click)="exportStats()">
            Exportar Estadísticas
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- DATOS EN CACHÉ -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Datos en Caché</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-text color="medium">
            <p>Juegos en caché: {{ (games$ | async)?.length || 0 }}</p>
            <p>Categorías en caché: {{ (categories$ | async)?.length || 0 }}</p>
          </ion-text>

          <ion-button expand="block" color="danger" (click)="clearCache()">
            Limpiar Caché
          </ion-button>

          <ion-button expand="block" color="warning" (click)="invalidateCache()">
            Invalidar Caché
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .stat {
      text-align: center;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
    }
  `]
})
export class SyncQueryApiDemoComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: Game[] = [];
  filteredByDifficulty: Game[] = [];
  selectedDifficulty = '';
  lastSearchTime = 0;

  totalGames = 0;
  totalCategories = 0;
  performanceStats: any = {};

  games$ = this.syncQueryApi.getGames$();
  categories$ = this.syncQueryApi.getCategories$();
  isSyncing$ = this.syncQueryApi.getIsSyncing$();
  lastSyncTime$ = this.syncQueryApi.getLastSyncTime$();
  syncError$ = this.syncQueryApi.getSyncError$();

  private destroy$ = new Subject<void>();

  constructor(private syncQueryApi: SyncQueryApiService) {}

  ngOnInit() {
    // Fuerza sincronización inicial
    this.syncQueryApi.forceSync('initial-load');

    // Suscribirse a cambios de caché
    this.games$
      .pipe(takeUntil(this.destroy$))
      .subscribe(games => {
        this.totalGames = games.length;
      });

    this.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.totalCategories = categories.length;
      });

    // Actualizar estadísticas cada segundo
    setInterval(() => {
      this.performanceStats = this.syncQueryApi.getPerformanceStats();
    }, 1000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Búsqueda SÍNCRONA ultra-rápida
   */
  onSearch(event: any) {
    const startTime = performance.now();

    // Búsqueda síncrona (sin esperar)
    this.searchResults = this.syncQueryApi.searchGamesByNameSync(this.searchQuery);

    this.lastSearchTime = Math.round((performance.now() - startTime) * 100) / 100;
  }

  /**
   * Filtro SÍNCRONO por dificultad
   */
  filterByDifficulty(event: any) {
    if (!this.selectedDifficulty) {
      this.filteredByDifficulty = this.syncQueryApi.getGamesSync();
    } else {
      this.filteredByDifficulty = this.syncQueryApi.getGamesByDifficultySync(
        this.selectedDifficulty
      );
    }
  }

  /**
   * Fuerza sincronización manual
   */
  forceSync() {
    this.syncQueryApi.forceSync('manual-user');
  }

  /**
   * Limpia caché
   */
  clearCache() {
    if (confirm('¿Deseas limpiar el caché? Se forzará una nueva sincronización.')) {
      this.syncQueryApi.clearCache();
      this.syncQueryApi.forceSync('after-clear');
    }
  }

  /**
   * Invalida caché
   */
  invalidateCache() {
    if (confirm('¿Deseas invalidar el caché? Esto forzará una nueva sincronización.')) {
      this.syncQueryApi.invalidateCache();
    }
  }

  /**
   * Exporta estadísticas
   */
  exportStats() {
    const json = this.syncQueryApi.exportCacheAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-stats-${new Date().getTime()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
