import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, switchMap, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { News } from '../models/news.model';
import { Game } from '../models/game.model';

/**
 * IL6: Servicio de consultas asincrónicas con persistencia automática
 * 
 * Proporciona métodos observables que:
 * 1. Intentan obtener datos de la API
 * 2. Guardan los resultados en base de datos local
 * 3. En caso de error, retornan datos en caché
 * 4. Mantienen estado sincronizado con observables
 */
@Injectable({ providedIn: 'root' })
export class AsyncPersistenceService {
  // Estados observables para cada tipo de dato
  private news$ = new BehaviorSubject<News[]>([]);
  private games$ = new BehaviorSubject<Game[]>([]);
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private api: ApiService,
    private db: DatabaseService
  ) {
    this.initializeFromCache();
  }

  /**
   * Carga datos en caché al inicializar el servicio
   */
  private initializeFromCache() {
    // Carga noticias desde caché
    this.db.getKeyValue<News[]>('news').then(cached => {
      if (cached) {
        this.news$.next(cached);
      }
    }).catch(err => {
      console.warn('Error cargando noticias en caché', err);
    });

    // Carga juegos desde caché
    this.db.getKeyValue<Game[]>('games').then(cached => {
      if (cached) {
        this.games$.next(cached);
      }
    }).catch(err => {
      console.warn('Error cargando juegos en caché', err);
    });
  }

  /**
   * Obtiene noticias desde API con persistencia automática
   * 
   * Flujo:
   * 1. Intenta descargar de la API
   * 2. Si éxito, guarda en BD local y retorna
   * 3. Si error, retorna datos en caché
   * 4. Actualiza el observable
   */
  getNewsWithPersistence(): Observable<News[]> {
    this.isLoading$.next(true);

    return this.api.get<News[]>('posts').pipe(
      tap(news => {
        // Guarda en BD local de forma asíncrona (no bloqueante)
        this.db.setKeyValue('news', news).catch(err => {
          console.warn('Error guardando noticias en caché', err);
        });
        // Actualiza el observable
        this.news$.next(news);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        console.warn('Error al obtener noticias de API, usando caché', err);
        // Retorna datos en caché si la API falla
        const cached = this.news$.getValue();
        this.isLoading$.next(false);
        if (cached.length > 0) {
          return of(cached);
        }
        // Si no hay caché, propaga el error
        return throwError(() => ({
          message: 'Error de conexión y sin datos en caché',
          originalError: err
        }));
      })
    );
  }

  /**
   * Obtiene juegos desde API con persistencia automática
   */
  getGamesWithPersistence(): Observable<Game[]> {
    this.isLoading$.next(true);

    return this.api.get<Game[]>('games').pipe(
      tap(games => {
        // Guarda en BD local
        this.db.setKeyValue('games', games).catch(err => {
          console.warn('Error guardando juegos en caché', err);
        });
        // Actualiza el observable
        this.games$.next(games);
        this.isLoading$.next(false);
      }),
      catchError(err => {
        console.warn('Error al obtener juegos de API, usando caché', err);
        // Retorna datos en caché si la API falla
        const cached = this.games$.getValue();
        this.isLoading$.next(false);
        if (cached.length > 0) {
          return of(cached);
        }
        return throwError(() => ({
          message: 'Error de conexión y sin datos en caché',
          originalError: err
        }));
      })
    );
  }

  /**
   * Obtiene noticias con caché en memoria (no hace llamada a API si ya están cargadas)
   */
  getNewsCached(): Observable<News[]> {
    return this.news$.asObservable();
  }

  /**
   * Obtiene juegos con caché en memoria
   */
  getGamesCached(): Observable<Game[]> {
    return this.games$.asObservable();
  }

  /**
   * Observable de estado de carga
   */
  getIsLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  /**
   * Obtiene una noticia específica desde caché
   */
  getNewsByIdAsync(id: number): Observable<News | null> {
    return this.news$.pipe(
      switchMap(news => {
        const found = news.find(n => n.id === id);
        return of(found || null);
      })
    );
  }

  /**
   * Busca noticias por texto desde caché
   */
  searchNewsAsync(query: string): Observable<News[]> {
    return this.news$.pipe(
      switchMap(news => {
        if (!query || query.trim().length === 0) {
          return of(news);
        }
        const lowerQuery = query.toLowerCase();
        const filtered = news.filter(n => 
          n.title?.toLowerCase().includes(lowerQuery) ||
          n.body?.toLowerCase().includes(lowerQuery)
        );
        return of(filtered);
      })
    );
  }

  /**
   * Obtiene un juego específico desde caché
   */
  getGameByIdAsync(id: number): Observable<Game | null> {
    return this.games$.pipe(
      switchMap(games => {
        const found = games.find(g => g.id === id);
        return of(found || null);
      })
    );
  }

  /**
   * Obtiene juegos de una categoría desde caché
   */
  getGamesByCategoryAsync(categoryId: number): Observable<Game[]> {
    return this.games$.pipe(
      switchMap(games => {
        const filtered = games.filter(g => g.categoryId === categoryId);
        return of(filtered);
      })
    );
  }

  /**
   * Busca juegos por nombre desde caché
   */
  searchGamesAsync(query: string): Observable<Game[]> {
    return this.games$.pipe(
      switchMap(games => {
        if (!query || query.trim().length === 0) {
          return of([]);
        }
        const lowerQuery = query.toLowerCase();
        const filtered = games.filter(g => g.name.toLowerCase().includes(lowerQuery));
        return of(filtered);
      })
    );
  }

  /**
   * Obtiene estadísticas de juegos desde caché
   */
  getGameStatisticsAsync(): Observable<{ totalGames: number; byCategory: { [key: number]: number } }> {
    return this.games$.pipe(
      switchMap(games => {
        const stats = {
          totalGames: games.length,
          byCategory: {} as { [key: number]: number }
        };
        games.forEach(g => {
          stats.byCategory[g.categoryId] = (stats.byCategory[g.categoryId] || 0) + 1;
        });
        return of(stats);
      })
    );
  }

  /**
   * Fuerza actualización desde API (recarga completa)
   */
  refreshNews(): Observable<News[]> {
    return this.getNewsWithPersistence();
  }

  /**
   * Fuerza actualización de juegos desde API
   */
  refreshGames(): Observable<Game[]> {
    return this.getGamesWithPersistence();
  }

  /**
   * Limpia caché local manualmente
   */
  clearCache(): Promise<void> {
    return Promise.all([
      this.db.setKeyValue('news', []),
      this.db.setKeyValue('games', [])
    ]).then(() => {
      this.news$.next([]);
      this.games$.next([]);
    });
  }

  /**
   * Obtiene tamaño del caché en bytes (aproximado)
   */
  async getCacheSizeBytes(): Promise<number> {
    try {
      const news = await this.db.getKeyValue<News[]>('news');
      const games = await this.db.getKeyValue<Game[]>('games');
      const newsSize = JSON.stringify(news).length;
      const gamesSize = JSON.stringify(games).length;
      return newsSize + gamesSize;
    } catch (err) {
      console.warn('Error calculando tamaño de caché', err);
      return 0;
    }
  }

  /**
   * Exporta todos los datos en caché como JSON (para depuración o backup)
   */
  exportCacheAsJson(): string {
    return JSON.stringify({
      news: this.news$.getValue(),
      games: this.games$.getValue(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}
