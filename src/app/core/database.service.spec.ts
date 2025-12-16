// src/app/core/database.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import { News } from '../models/news.model';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [DatabaseService]
    });
    service = TestBed.inject(DatabaseService);
    
    // Inicializar DB
    await service.init();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('News Management', () => {
    it('should load all news', async () => {
      const news = await service.getAllNews();
      expect(Array.isArray(news)).toBe(true);
      expect(news.length).toBeGreaterThan(0);
    });

    it('should add a news item', async () => {
      const newNews: News = {
        title: 'Test News',
        content: 'Test content'
      };

      const id = await service.addNews(newNews);
      expect(id).toBeTruthy();

      const allNews = await service.getAllNews();
      const addedNews = allNews.find(n => n.id === id);
      expect(addedNews?.title).toBe('Test News');
    });

    it('should delete a news item', async () => {
      const newNews: News = {
        title: 'To Delete',
        content: 'This will be deleted'
      };

      const id = await service.addNews(newNews);
      expect(id).toBeTruthy();

      const allBeforeDelete = await service.getAllNews();
      const countBefore = allBeforeDelete.find(n => n.id === id) ? 1 : 0;
      expect(countBefore).toBe(1); // Debe existir antes de eliminar

      const deleted = await service.deleteNews(id!);
      expect(deleted).toBe(true);

      const allAfterDelete = await service.getAllNews();
      const countAfter = allAfterDelete.find(n => n.id === id) ? 1 : 0;
      expect(countAfter).toBe(0); // No debe existir después de eliminar
    });
  });

  describe('Key-Value Store', () => {
    it('should set and get key-value pairs', async () => {
      const testKey = 'test_key';
      const testValue = { message: 'test value' };

      await service.setKeyValue(testKey, testValue);
      const retrieved = await service.getKeyValue<typeof testValue>(testKey);

      expect(retrieved).toEqual(testValue);
    });

    it('should return null for non-existing keys', async () => {
      const value = await service.getKeyValue('non_existing_key');
      expect(value).toBeNull();
    });
  });

  describe('Ready State', () => {
    it('should emit ready$ when initialized', (done) => {
      service.ready$.subscribe(isReady => {
        if (isReady) {
          expect(isReady).toBe(true);
          done();
        }
      });
    });
  });
});
