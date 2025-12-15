import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private cacheKey = 'posts';

  constructor(private api: ApiService, private db: DatabaseService) {}

  // fetch posts from remote and cache locally (SQLite or fallback)
  fetchAndCachePosts() {
    return this.api.get<any[]>('posts').pipe(
      tap(async posts => {
        try {
          await this.db.setKeyValue(this.cacheKey, posts);
        } catch (e) {
          console.warn('Failed to cache posts', e);
        }
      }),
      catchError(err => {
        // on error, try to return cached value instead of throwing
        return of(null);
      })
    );
  }

  // read cached posts (returns null if none)
  async getCachedPosts() {
    return await this.db.getKeyValue<any[]>(this.cacheKey);
  }
}
