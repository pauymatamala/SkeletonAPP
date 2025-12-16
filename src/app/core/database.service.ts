import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';
// Avoid static import of @capacitor-community/sqlite to prevent build errors
// when package is present without compiled dist files in node_modules.

import { News } from '../models/news.model';
import { Game } from '../models/game.model';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private isNative = false;
  private db: any = null;
  private fallbackKey = 'app_news_fallback';

  public ready$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  async init() {
    try {
      const platform = Capacitor.getPlatform();
      // consider native when not web
      this.isNative = platform !== 'web';

      if (this.isNative) {
        // create/open connection using dynamic global plugin reference
        try {
          const capSql = (globalThis as any).CapacitorSQLite;
          if (!capSql || !capSql.createConnection) {
            throw new Error('CapacitorSQLite plugin not available at runtime');
          }
          this.db = await capSql.createConnection({
            database: 'appdb',
            version: 1,
            encrypted: false,
            mode: 'no-encryption'
          });
          await this.db.open();
          await this.createTables();
          await this.seedIfEmpty();
        } catch (err) {
          console.warn('Native CapacitorSQLite not available, falling back', err);
          this.isNative = false;
          const existing = localStorage.getItem(this.fallbackKey);
          if (!existing) localStorage.setItem(this.fallbackKey, JSON.stringify([]));
        }
      } else {
        // ensure fallback structure exists
        const existing = localStorage.getItem(this.fallbackKey);
        if (!existing) localStorage.setItem(this.fallbackKey, JSON.stringify([]));
      }

      this.ready$.next(true);
    } catch (err) {
      console.warn('Database init failed, using fallback', err);
      this.isNative = false;
      const existing = localStorage.getItem(this.fallbackKey);
      if (!existing) localStorage.setItem(this.fallbackKey, JSON.stringify([]));
      this.ready$.next(true);
    }
  }

  private async createTables() {
    const createUsers = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      displayName TEXT,
      avatar TEXT
    );`;

    const createCategories = `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      image TEXT
    );`;

    const createGames = `CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category_id INTEGER,
      price TEXT,
      image TEXT
    );`;

    const createNews = `CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      date TEXT
    );`;
    const createKV = `CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT
    );`;

    if (this.isNative && this.db) {
      try {
        await this.db.execute(createUsers);
        await this.db.execute(createCategories);
        await this.db.execute(createGames);
        await this.db.execute(createNews);
        await this.db.execute(createKV);
      } catch (err) {
        console.error('createTables error', err);
      }
    }
  }

  // seed initial categories and games if empty
  private async seedIfEmpty() {
    try {
      if (this.isNative && this.db) {
        const res = await this.db.query('SELECT COUNT(*) as cnt FROM categories');
        const count = res && ((res.values && res.values[0] && res.values[0].cnt) || (res.rows && res.rows.length) || 0);
        if (!count || Number(count) === 0) {
          // insert sample categories and games
          const categories: Category[] = [
            { name: 'Acción', image: 'https://picsum.photos/seed/accion/64/64' },
            { name: 'Aventura', image: 'https://picsum.photos/seed/aventura/64/64' },
            { name: 'Estrategia', image: 'https://picsum.photos/seed/estrategia/64/64' },
            { name: 'Deportes', image: 'https://picsum.photos/seed/deportes/64/64' },
            { name: 'Puzzle', image: 'https://picsum.photos/seed/puzzle/64/64' }
          ];
          for (const cat of categories) {
            await this.db.run('INSERT INTO categories (name, image) VALUES (?, ?)', [cat.name, cat.image]);
            const cidRes = await this.db.query('SELECT last_insert_rowid() as id');
            const cid = cidRes && cidRes.values && cidRes.values[0] && cidRes.values[0].id;
            // add 5 sample games for this category
            for (let i = 1; i <= 5; i++) {
              const title = `${cat.name} Game ${i}`;
              const price = `$${(i * 1.99).toFixed(2)}`;
              const img = `https://picsum.photos/seed/${cat.name}${i}/640/360`;
              await this.db.run('INSERT INTO games (title, category_id, price, image) VALUES (?, ?, ?, ?)', [title, cid || null, price, img]);
            }
          }
        }
      } else {
        // fallback: populate localStorage if empty
        const existing = localStorage.getItem('app_games_fallback');
        if (!existing) {
          const list: Game[] = [];
          const cats = ['Acción','Aventura','Estrategia','Deportes','Puzzle'];
          let id = 1;
          for (let catIdx = 0; catIdx < cats.length; catIdx++) {
            const c = cats[catIdx];
            for (let i = 1; i <= 5; i++) {
              list.push({
                id: id++,
                name: `${c} Game ${i}`,
                title: `${c} Game ${i}`,
                categoryId: catIdx + 1,
                category: c,
                description: `This is an awesome ${c.toLowerCase()} game`,
                rules: `Play and have fun with ${c.toLowerCase()}`,
                difficulty: i <= 2 ? 'Easy' : i <= 4 ? 'Medium' : 'Hard',
                price: `$${(i*1.99).toFixed(2)}`,
                image: `https://picsum.photos/seed/${c}${i}/640/360`
              });
            }
          }
          localStorage.setItem('app_games_fallback', JSON.stringify(list));
        }
      }
    } catch (err) {
      console.warn('seedIfEmpty error', err);
    }
  }

  async getAllNews(): Promise<News[]> {
    if (this.isNative && this.db) {
      try {
        const res = await this.db.query('SELECT * FROM news ORDER BY id DESC');
        // plugin may return rows under 'values' or 'rows'
        const rows = res && (res.values || res.rows || res.result || []);
        return rows || [];
      } catch (err) {
        console.error('getAllNews (native) failed', err);
        return [];
      }
    }

    // fallback
    const raw = localStorage.getItem(this.fallbackKey) || '[]';
    return JSON.parse(raw) as News[];
  }

  // simple key/value cache helpers (used for offline sync)
  async setKeyValue(key: string, value: any): Promise<boolean> {
    const raw = JSON.stringify(value);
    if (this.isNative && this.db) {
      try {
        await this.db.run('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, raw]);
        return true;
      } catch (err) {
        console.error('setKeyValue (native) failed', err);
        return false;
      }
    }

    localStorage.setItem(`kv_${key}`, raw);
    return true;
  }

  async getKeyValue<T = any>(key: string): Promise<T | null> {
    if (this.isNative && this.db) {
      try {
        const res = await this.db.query('SELECT value FROM kv_store WHERE key = ?', [key]);
        const rows = res && (res.values || res.rows || []);
        if (rows && rows[0] && rows[0].value) {
          return JSON.parse(rows[0].value) as T;
        }
        return null;
      } catch (err) {
        console.error('getKeyValue (native) failed', err);
        return null;
      }
    }

    const raw = localStorage.getItem(`kv_${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return null;
    }
  }

  async addNews(item: News): Promise<number | null> {
    if (this.isNative && this.db) {
      try {
        const sql = 'INSERT INTO news (title, content, date) VALUES (?, ?, ?)';
        const date = item.date || new Date().toISOString();
        const res = await this.db.run(sql, [item.title, item.content, date]);
        // plugin may return lastId or changes
        const lastId = res && (res.lastId || (res.changes && res.changes.lastId) || null);
        return lastId;
      } catch (err) {
        console.error('addNews (native) failed', err);
        return null;
      }
    }

    // fallback
    const all = await this.getAllNews();
    const id = (all.length ? (all[0].id || 0) : 0) + 1;
    const record: News = { id, title: item.title, content: item.content, date: item.date || new Date().toISOString() };
    all.unshift(record);
    localStorage.setItem(this.fallbackKey, JSON.stringify(all));
    return id;
  }

  async deleteNews(id: number): Promise<boolean> {
    if (this.isNative && this.db) {
      try {
        await this.db.run('DELETE FROM news WHERE id = ?', [id]);
        return true;
      } catch (err) {
        console.error('deleteNews (native) failed', err);
        return false;
      }
    }

    const all = await this.getAllNews();
    const filtered = all.filter(n => n.id !== id);
    localStorage.setItem(this.fallbackKey, JSON.stringify(filtered));
    return true;
  }

  // simple update by id
  async updateNews(item: News): Promise<boolean> {
    if (!item.id) return false;
    if (this.isNative && this.db) {
      try {
        await this.db.run('UPDATE news SET title = ?, content = ?, date = ? WHERE id = ?', [item.title, item.content, item.date || new Date().toISOString(), item.id]);
        return true;
      } catch (err) {
        console.error('updateNews (native) failed', err);
        return false;
      }
    }

    const all = await this.getAllNews();
    const idx = all.findIndex(n => n.id === item.id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...item };
    localStorage.setItem(this.fallbackKey, JSON.stringify(all));
    return true;
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    if (this.isNative && this.db) {
      try {
        const res = await this.db.query('SELECT * FROM categories ORDER BY name');
        const rows = res && (res.values || res.rows || []);
        return rows || [];
      } catch (err) {
        console.error('getCategories (native) failed', err);
        return [];
      }
    }

    // fallback: derive categories from fallback games or stored categories
    const gamesRaw = localStorage.getItem('app_games_fallback');
    if (gamesRaw) {
      const games: Game[] = JSON.parse(gamesRaw);
      const names = Array.from(new Set(games.map(g => g.category)));
      return names.map((n, i) => ({ id: i + 1, name: n } as Category));
    }
    return [];
  }

  // Get games by category name
  async getGamesByCategory(categoryName: string): Promise<Game[]> {
    if (this.isNative && this.db) {
      try {
        const cidRes = await this.db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
        const cid = cidRes && cidRes.values && cidRes.values[0] && cidRes.values[0].id;
        if (!cid) return [];
        const res = await this.db.query('SELECT * FROM games WHERE category_id = ? ORDER BY id DESC', [cid]);
        const rows = res && (res.values || res.rows || []);
        return rows || [];
      } catch (err) {
        console.error('getGamesByCategory (native) failed', err);
        return [];
      }
    }

    // fallback
    const raw = localStorage.getItem('app_games_fallback') || '[]';
    const all: Game[] = JSON.parse(raw);
    return all.filter(g => g.category === categoryName);
  }

  // Add a new category (returns id or null)
  async addCategory(name: string, image?: string): Promise<number | null> {
    if (this.isNative && this.db) {
      try {
        await this.db.run('INSERT INTO categories (name, image) VALUES (?, ?)', [name, image || null]);
        const cidRes = await this.db.query('SELECT last_insert_rowid() as id');
        const cid = cidRes && cidRes.values && cidRes.values[0] && cidRes.values[0].id;
        return cid || null;
      } catch (err) {
        console.error('addCategory (native) failed', err);
        return null;
      }
    }

    // fallback store categories separately
    const raw = localStorage.getItem('app_categories_fallback') || '[]';
    const cats: Category[] = JSON.parse(raw);
    const id = (cats.length ? (cats[cats.length - 1].id || cats.length) : 0) + 1;
    const record: Category = { id, name, image: image || null } as Category;
    cats.push(record);
    localStorage.setItem('app_categories_fallback', JSON.stringify(cats));
    // also add to games fallback as category label might be used
    const gamesRaw = localStorage.getItem('app_games_fallback') || '[]';
    localStorage.setItem('app_games_fallback', gamesRaw);
    return id;
  }

  // Add a new game. category can be a name; will resolve to id in native mode or store category name in fallback
  async addGame(title: string, categoryName: string, price: string, image?: string): Promise<number | null> {
    if (this.isNative && this.db) {
      try {
        // find category id
        let cidRes = await this.db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
        let cid = cidRes && cidRes.values && cidRes.values[0] && cidRes.values[0].id;
        if (!cid) {
          // create category
          await this.db.run('INSERT INTO categories (name, image) VALUES (?, ?)', [categoryName, null]);
          const newCidRes = await this.db.query('SELECT last_insert_rowid() as id');
          cid = newCidRes && newCidRes.values && newCidRes.values[0] && newCidRes.values[0].id;
        }
        await this.db.run('INSERT INTO games (title, category_id, price, image) VALUES (?, ?, ?, ?)', [title, cid || null, price, image || null]);
        const res = await this.db.query('SELECT last_insert_rowid() as id');
        const gid = res && res.values && res.values[0] && res.values[0].id;
        return gid || null;
      } catch (err) {
        console.error('addGame (native) failed', err);
        return null;
      }
    }

    // fallback
    const raw = localStorage.getItem('app_games_fallback') || '[]';
    const all: Game[] = JSON.parse(raw);
    const id = (all.length ? (all[all.length - 1].id || all.length) : 0) + 1;
    const record: Game = { id, title, category: categoryName, price, image: image || null } as Game;
    all.push(record);
    localStorage.setItem('app_games_fallback', JSON.stringify(all));
    return id;
  }
}
