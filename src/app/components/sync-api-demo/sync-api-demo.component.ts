import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SyncApiCacheService } from '../../core/sync-api-cache.service';

/**
 * Componente de demostración: Consultas Síncronas a API
 * 
 * Resuelve los requerimientos del cliente mostrando:
 * 1. Dashboard con datos cargados instantáneamente desde caché
 * 2. Actualización automática en background desde API
 * 3. Búsqueda rápida y sincrónica
 * 4. Estadísticas de caché
 */
@Component({
  selector: 'app-sync-api-demo',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './sync-api-demo.component.html',
  styleUrls: ['./sync-api-demo.component.scss']
})
export class SyncApiDemoComponent implements OnInit {
  // Datos síncronos (acceso instantáneo)
  posts: any[] = [];
  users: any[] = [];
  comments: any[] = [];

  // Observables para reactividad
  isLoadingPosts$ = this.syncApi.getLoadingPostsState();
  isLoadingUsers$ = this.syncApi.getLoadingUsersState();

  // Estados
  activeTab = 'posts';
  searchQuery = '';
  searchResults: any = { posts: [], users: [], comments: [] };
  cacheStats: any = null;

  constructor(private syncApi: SyncApiCacheService) {}

  ngOnInit() {
    // Cargar datos de forma síncrona (instantáneo)
    this.loadDataSync();

    // Escuchar cambios en observables (reactividad)
    this.syncApi.getPosts$().subscribe((posts: any[]) => {
      this.posts = posts;
    });

    this.syncApi.getUsers$().subscribe((users: any[]) => {
      this.users = users;
    });

    this.syncApi.getComments$().subscribe((comments: any[]) => {
      this.comments = comments;
    });

    // Actualizar estadísticas cada 2 segundos
    setInterval(() => {
      this.updateStats();
    }, 2000);
  }

  /**
   * Carga datos de forma SÍNCRONA (sin esperar)
   */
  private loadDataSync() {
    console.log('⚡ Cargando datos de forma SÍNCRONA...');
    const start = performance.now();

    // Estas llamadas retornan datos instantáneamente desde caché
    this.posts = this.syncApi.getPostsSync();
    this.users = this.syncApi.getUsersSync();
    this.comments = this.syncApi.getCommentsSync();

    const end = performance.now();
    console.log(`✅ Datos cargados en ${(end - start).toFixed(2)}ms (desde caché)`);
  }

  /**
   * Búsqueda síncrona (resultado instantáneo)
   */
  onSearch() {
    if (!this.searchQuery || this.searchQuery.length === 0) {
      this.searchResults = { posts: [], users: [], comments: [] };
      return;
    }

    const start = performance.now();
    this.searchResults = this.syncApi.searchSync(this.searchQuery);
    const end = performance.now();

    console.log(`🔍 Búsqueda completada en ${(end - start).toFixed(2)}ms`);
  }

  /**
   * Actualiza estadísticas del caché
   */
  private updateStats() {
    this.cacheStats = this.syncApi.getCacheStatsSync();
  }

  /**
   * Fuerza sincronización desde API
   */
  forceSync() {
    console.log('🔄 Forzando sincronización desde API...');
    this.syncApi.forceSync().subscribe(() => {
      console.log('✅ Sincronización completada');
    });
  }

  /**
   * Limpia todos los caché
   */
  async clearCache() {
    await this.syncApi.clearAllCaches();
    this.posts = [];
    this.users = [];
    this.comments = [];
    this.searchResults = { posts: [], users: [], comments: [] };
    console.log('🗑️ Caché limpiado');
  }

  /**
   * Obtiene un post por ID
   */
  getPostDetail(id: number) {
    const post = this.syncApi.getPostByIdSync(id);
    const user = post ? this.syncApi.getUserByIdSync(post.userId) : null;
    const comments = post ? this.syncApi.getCommentsByPostIdSync(id) : [];

    return { post, user, comments };
  }

  /**
   * Formatea timestamp para mostrar
   */
  formatTimestamp(timestamp?: number): string {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
}
