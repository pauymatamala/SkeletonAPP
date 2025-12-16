import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';

/**
 * SyncApiCacheService: Consultas Síncronas a API con Caché Inteligente
 * 
 * Propósito: Resolver requerimientos de cliente entregando:
 * 1. Acceso rápido a datos (caché sincrónico en memoria)
 * 2. Actualización automática desde API
 * 3. Sincronización offline-first
 * 4. Notificaciones de cambios en tiempo real
 * 
 * Caso de uso: Dashboard que muestra datos en caché mientras actualiza desde API en background
 */
@Injectable({ providedIn: 'root' })
export class SyncApiCacheService {
  // Caché en memoria (acceso sincrónico instantáneo)
  private postsCache$ = new BehaviorSubject<any[]>([]);
  private usersCache$ = new BehaviorSubject<any[]>([]);
  private commentsCache$ = new BehaviorSubject<any[]>([]);

  // Estado de carga
  private isLoadingPosts$ = new BehaviorSubject<boolean>(false);
  private isLoadingUsers$ = new BehaviorSubject<boolean>(false);
  private lastSync$ = new BehaviorSubject<{ [key: string]: number }>({});

  // Intervalo de sincronización (ms)
  private SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private api: ApiService,
    private db: DatabaseService
  ) {
    this.initializeCaches();
    this.startAutoSync();
  }

  /**
   * Inicializa los caché desde BD local
   */
  private async initializeCaches() {
    try {
      // Cargar posts del caché
      const cachedPosts = await this.db.getKeyValue<any[]>('api_posts_cache');
      if (cachedPosts) {
        this.postsCache$.next(cachedPosts);
      }

      // Cargar usuarios del caché
      const cachedUsers = await this.db.getKeyValue<any[]>('api_users_cache');
      if (cachedUsers) {
        this.usersCache$.next(cachedUsers);
      }

      // Cargar comments del caché
      const cachedComments = await this.db.getKeyValue<any[]>('api_comments_cache');
      if (cachedComments) {
        this.commentsCache$.next(cachedComments);
      }
    } catch (err) {
      console.warn('Error inicializando caché', err);
    }
  }

  /**
   * Inicia sincronización automática en background
   */
  private startAutoSync() {
    // Sincronizar cada 5 minutos
    setInterval(() => {
      this.syncAllDataInBackground();
    }, this.SYNC_INTERVAL);

    // Sincronizar al iniciar
    this.syncAllDataInBackground();
  }

  /**
   * ============= POSTS =============
   */

  /**
   * Obtiene posts de forma SÍNCRONA desde caché
   * Actualiza desde API en background sin bloquear
   */
  getPostsSync(): any[] {
    // Retorna caché inmediatamente (sincrónico)
    const cached = this.postsCache$.getValue();
    
    // Actualiza desde API en background (no espera)
    this.syncPostsFromAPI();

    return cached;
  }

  /**
   * Observable de posts (para reactividad)
   */
  getPosts$(): Observable<any[]> {
    return this.postsCache$.asObservable();
  }

  /**
   * Estado de carga de posts
   */
  isLoadingPosts$(): Observable<boolean> {
    return this.isLoadingPosts$.asObservable();
  }

  /**
   * Sincroniza posts desde API
   */
  private syncPostsFromAPI() {
    const lastSync = this.lastSync$.getValue()['posts'] || 0;
    const now = Date.now();

    // No sincronizar si fue hace menos de 30 segundos
    if (now - lastSync < 30000) {
      return;
    }

    this.isLoadingPosts$.next(true);

    this.api.get('posts').pipe(
      tap(posts => {
        this.postsCache$.next(posts);
        this.db.setKeyValue('api_posts_cache', posts).catch(err => 
          console.warn('Error guardando posts en caché', err)
        );
        this.lastSync$.next({ ...this.lastSync$.getValue(), posts: now });
      }),
      catchError(err => {
        console.warn('Error sincronizando posts, usando caché', err);
        return of(this.postsCache$.getValue());
      }),
      finalize(() => this.isLoadingPosts$.next(false))
    ).subscribe();
  }

  /**
   * Busca un post por ID de forma síncrona
   */
  getPostByIdSync(id: number): any | null {
    const posts = this.postsCache$.getValue();
    return posts.find(p => p.id === id) || null;
  }

  /**
   * Filtra posts de forma síncrona
   */
  getPostsByUserIdSync(userId: number): any[] {
    return this.postsCache$.getValue().filter(p => p.userId === userId);
  }

  /**
   * ============= USUARIOS =============
   */

  /**
   * Obtiene usuarios de forma SÍNCRONA desde caché
   */
  getUsersSync(): any[] {
    const cached = this.usersCache$.getValue();
    this.syncUsersFromAPI();
    return cached;
  }

  /**
   * Observable de usuarios
   */
  getUsers$(): Observable<any[]> {
    return this.usersCache$.asObservable();
  }

  /**
   * Estado de carga de usuarios
   */
  isLoadingUsers$(): Observable<boolean> {
    return this.isLoadingUsers$.asObservable();
  }

  /**
   * Sincroniza usuarios desde API
   */
  private syncUsersFromAPI() {
    const lastSync = this.lastSync$.getValue()['users'] || 0;
    const now = Date.now();

    if (now - lastSync < 30000) {
      return;
    }

    this.isLoadingUsers$.next(true);

    this.api.get('users').pipe(
      tap(users => {
        this.usersCache$.next(users);
        this.db.setKeyValue('api_users_cache', users).catch(err =>
          console.warn('Error guardando usuarios en caché', err)
        );
        this.lastSync$.next({ ...this.lastSync$.getValue(), users: now });
      }),
      catchError(err => {
        console.warn('Error sincronizando usuarios, usando caché', err);
        return of(this.usersCache$.getValue());
      }),
      finalize(() => this.isLoadingUsers$.next(false))
    ).subscribe();
  }

  /**
   * Obtiene un usuario por ID de forma síncrona
   */
  getUserByIdSync(id: number): any | null {
    return this.usersCache$.getValue().find(u => u.id === id) || null;
  }

  /**
   * ============= COMMENTS =============
   */

  /**
   * Obtiene comments de forma SÍNCRONA desde caché
   */
  getCommentsSync(): any[] {
    const cached = this.commentsCache$.getValue();
    this.syncCommentsFromAPI();
    return cached;
  }

  /**
   * Observable de comments
   */
  getComments$(): Observable<any[]> {
    return this.commentsCache$.asObservable();
  }

  /**
   * Obtiene comments de un post
   */
  getCommentsByPostIdSync(postId: number): any[] {
    return this.commentsCache$.getValue().filter(c => c.postId === postId);
  }

  /**
   * Sincroniza comments desde API
   */
  private syncCommentsFromAPI() {
    const lastSync = this.lastSync$.getValue()['comments'] || 0;
    const now = Date.now();

    if (now - lastSync < 30000) {
      return;
    }

    this.api.get('comments').pipe(
      tap(comments => {
        this.commentsCache$.next(comments);
        this.db.setKeyValue('api_comments_cache', comments).catch(err =>
          console.warn('Error guardando comments en caché', err)
        );
        this.lastSync$.next({ ...this.lastSync$.getValue(), comments: now });
      }),
      catchError(err => {
        console.warn('Error sincronizando comments, usando caché', err);
        return of(this.commentsCache$.getValue());
      })
    ).subscribe();
  }

  /**
   * ============= SINCRONIZACIÓN GENERAL =============
   */

  /**
   * Sincroniza todos los datos en background sin bloquear
   */
  private syncAllDataInBackground() {
    // Fire and forget
    this.syncPostsFromAPI();
    this.syncUsersFromAPI();
    this.syncCommentsFromAPI();
  }

  /**
   * Sincroniza todos los datos de forma inmediata
   */
  forceSync(): Observable<boolean> {
    this.syncAllDataInBackground();
    return of(true);
  }

  /**
   * ============= ESTADÍSTICAS =============
   */

  /**
   * Obtiene estadísticas de caché de forma síncrona
   */
  getCacheStatsSync(): {
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    cachedAt: { [key: string]: number };
  } {
    return {
      totalPosts: this.postsCache$.getValue().length,
      totalUsers: this.usersCache$.getValue().length,
      totalComments: this.commentsCache$.getValue().length,
      cachedAt: this.lastSync$.getValue()
    };
  }

    /**
     * Obtiene estadísticas avanzadas (compatible con template)
     */
    getCacheStats(): {
      postCount: number;
      userCount: number;
      commentCount: number;
      lastUpdate?: number;
      age: number;
    } {
      const lastSyncMap = this.lastSync$.getValue();
      const mostRecentSync = Math.max(...Object.values(lastSyncMap), 0);
      const age = Math.floor((Date.now() - mostRecentSync) / 1000);

      return {
        postCount: this.postsCache$.getValue().length,
        userCount: this.usersCache$.getValue().length,
        commentCount: this.commentsCache$.getValue().length,
        lastUpdate: mostRecentSync || undefined,
        age: age
      };
    }

  /**
   * ============= BÚSQUEDA GLOBAL SÍNCRONA =============
   */

  /**
   * Busca en todas las fuentes de forma síncrona
   */
  searchSync(query: string): {
    posts: any[];
    users: any[];
    comments: any[];
  } {
    const lowerQuery = query.toLowerCase();

    return {
      posts: this.postsCache$.getValue().filter(p =>
        p.title?.toLowerCase().includes(lowerQuery) ||
        p.body?.toLowerCase().includes(lowerQuery)
      ),
      users: this.usersCache$.getValue().filter(u =>
        u.name?.toLowerCase().includes(lowerQuery) ||
        u.email?.toLowerCase().includes(lowerQuery)
      ),
      comments: this.commentsCache$.getValue().filter(c =>
        c.body?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery)
      )
    };
  }

  /**
   * ============= LIMPIEZA =============
   */

  /**
   * Limpia todos los caché
   */
  async clearAllCaches(): Promise<void> {
    this.postsCache$.next([]);
    this.usersCache$.next([]);
    this.commentsCache$.next([]);
    this.lastSync$.next({});

    await Promise.all([
      this.db.setKeyValue('api_posts_cache', []),
      this.db.setKeyValue('api_users_cache', []),
      this.db.setKeyValue('api_comments_cache', [])
    ]);
  }

  /**
   * Búsqueda de usuarios por query síncrona
   */
  searchUsersSync(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    return this.usersCache$.getValue().filter(u =>
      u.name?.toLowerCase().includes(lowerQuery) ||
      u.email?.toLowerCase().includes(lowerQuery) ||
      u.username?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Búsqueda de posts por query síncrona
   */
  searchPostsSync(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    return this.postsCache$.getValue().filter(p =>
      p.title?.toLowerCase().includes(lowerQuery) ||
      p.body?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Búsqueda de comentarios por query síncrona
   */
  searchCommentsSync(query: string): any[] {
    const lowerQuery = query.toLowerCase();
    return this.commentsCache$.getValue().filter(c =>
      c.body?.toLowerCase().includes(lowerQuery) ||
      c.email?.toLowerCase().includes(lowerQuery) ||
      c.name?.toLowerCase().includes(lowerQuery)
    );
  }
}
