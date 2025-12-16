import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Game } from '../models/game.model';
import { Category } from '../models/category.model';

/**
 * IL5: Servicio para consultas síncronas (o pseudo-síncronas) de base de datos
 * 
 * Proporciona métodos de consulta inmediata contra la base de datos
 * (SQLite nativo o localStorage), sin necesidad de observables.
 * 
 * Nota: En navegadores modernos con async/await, estas consultas
 * se manejan de forma asíncrona internamente pero exponen una
 * interfaz más simple al consumidor.
 */
@Injectable({ providedIn: 'root' })
export class SyncQueryService {
  constructor(private db: DatabaseService) {}

  /**
   * Obtiene todas las categorías de forma inmediata (en caché)
   * Esta operación es rápida porque los datos ya están en memoria o localstorage
   */
  getAllCategoriesSync(): Category[] {
    try {
      const stored = localStorage.getItem('app_categories');
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (err) {
      console.warn('Error en getAllCategoriesSync', err);
      return [];
    }
  }

  /**
   * Obtiene una categoría específica por ID de forma síncrona
   */
  getCategoryByIdSync(id: number): Category | null {
    try {
      const categories = this.getAllCategoriesSync();
      return categories.find(c => c.id === id) || null;
    } catch (err) {
      console.warn('Error en getCategoryByIdSync', err);
      return null;
    }
  }

  /**
   * Obtiene todos los juegos de forma síncrona
   */
  getAllGamesSync(): Game[] {
    try {
      const stored = localStorage.getItem('app_games');
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (err) {
      console.warn('Error en getAllGamesSync', err);
      return [];
    }
  }

  /**
   * Obtiene los juegos de una categoría específica de forma síncrona
   */
  getGamesByCategorySync(categoryId: number): Game[] {
    try {
      const games = this.getAllGamesSync();
      return games.filter(g => g.categoryId === categoryId);
    } catch (err) {
      console.warn('Error en getGamesByCategorySync', err);
      return [];
    }
  }

  /**
   * Obtiene un juego específico por ID de forma síncrona
   */
  getGameByIdSync(id: number): Game | null {
    try {
      const games = this.getAllGamesSync();
      return games.find(g => g.id === id) || null;
    } catch (err) {
      console.warn('Error en getGameByIdSync', err);
      return null;
    }
  }

  /**
   * Busca juegos por nombre (búsqueda de texto) de forma síncrona
   */
  searchGamesByNameSync(query: string): Game[] {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }
      const games = this.getAllGamesSync();
      const lowerQuery = query.toLowerCase();
      return games.filter(g => g.name.toLowerCase().includes(lowerQuery));
    } catch (err) {
      console.warn('Error en searchGamesByNameSync', err);
      return [];
    }
  }

  /**
   * Obtiene el contador de juegos en una categoría de forma síncrona
   */
  getGameCountByCategorySync(categoryId: number): number {
    try {
      return this.getGamesByCategorySync(categoryId).length;
    } catch (err) {
      console.warn('Error en getGameCountByCategorySync', err);
      return 0;
    }
  }

  getNonEmptyCategoriesSync(): Category[] {
    try {
      const categories = this.getAllCategoriesSync();
      return categories.filter(c => {
        const catId = c.id || 0;
        return this.getGameCountByCategorySync(catId) > 0;
      });
    } catch (err) {
      console.warn('Error en getNonEmptyCategoriesSync', err);
      return [];
    }
  }

  /**
   * Obtiene un juego aleatorio de una categoría
   */
  getRandomGameByCategorySync(categoryId: number): Game | null {
    try {
      const games = this.getGamesByCategorySync(categoryId);
      if (games.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * games.length);
      return games[randomIndex];
    } catch (err) {
      console.warn('Error en getRandomGameByCategorySync', err);
      return null;
    }
  }

  /**
   * Valida si un juego existe por ID
   */
  gameExistsSync(gameId: number): boolean {
    try {
      return this.getGameByIdSync(gameId) !== null;
    } catch (err) {
      console.warn('Error en gameExistsSync', err);
      return false;
    }
  }

  /**
   * Obtiene juegos por nivel de dificultad
   */
  getGamesByDifficultySync(difficulty: string): Game[] {
    try {
      const games = this.getAllGamesSync();
      return games.filter(g => g.difficulty?.toLowerCase() === difficulty.toLowerCase());
    } catch (err) {
      console.warn('Error en getGamesByDifficultySync', err);
      return [];
    }
  }

  /**
   * Cuenta el total de juegos en la aplicación
   */
  getTotalGameCountSync(): number {
    try {
      return this.getAllGamesSync().length;
    } catch (err) {
      console.warn('Error en getTotalGameCountSync', err);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas rápidas (conteos por categoría)
   */
  getStatisticsSync(): { totalCategories: number; totalGames: number; gamesByCategory: { [key: number]: number } } {
    try {
      const categories = this.getAllCategoriesSync();
      const gamesByCategory: { [key: number]: number } = {};

      categories.forEach(cat => {
        const catId = cat.id || 0;
        gamesByCategory[catId] = this.getGameCountByCategorySync(catId);
      });

      return {
        totalCategories: categories.length,
        totalGames: this.getTotalGameCountSync(),
        gamesByCategory
      };
    } catch (err) {
      console.warn('Error en getStatisticsSync', err);
      return { totalCategories: 0, totalGames: 0, gamesByCategory: {} };
    }
  }
}
