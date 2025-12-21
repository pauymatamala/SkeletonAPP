import { Component } from '@angular/core';
import { DatabaseService } from './core/database.service';
import { StorageService } from './core/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public isAdmin = false;

  constructor(private database: DatabaseService, private storage: StorageService, private router: Router) {
    void this.initializeApp();
  }

  private async initializeApp() {
    console.log('APP: Initializing app...');
    try {
      await this.database.init();
    } catch (err) {
      console.warn('Database init failed on app start', err);
    }

    try {
      // Initialize storage first
      await this.storage.init();
      console.log('APP: Storage initialized');
      
      // Seed admin user if missing
      const ADMIN_EMAIL = 'Admin@gmail.com';
      const ADMIN_PASS = 'Prueba123';
      const ADMIN_NAME = 'Admin';

      const users = (await this.storage.get<Record<string, string>>('users')) || {};
      console.log('APP: Current users before seeding:', Object.keys(users));
      
      let changed = false;
      if (!users[ADMIN_EMAIL]) { 
        users[ADMIN_EMAIL] = ADMIN_PASS; 
        changed = true; 
        console.log('APP: Added admin user with exact case');
      }
      if (!users[ADMIN_EMAIL.toLowerCase()]) { 
        users[ADMIN_EMAIL.toLowerCase()] = ADMIN_PASS; 
        changed = true; 
        console.log('APP: Added admin user with lowercase');
      }
      
      if (changed) { 
        await this.storage.set('users', users); 
        console.log('APP: Saved users to storage');
        
        // Verify it was saved
        const savedUsers = await this.storage.get<Record<string, string>>('users');
        console.log('APP: Verified users in storage:', Object.keys(savedUsers || {}));
        
        // Show all keys in storage
        const allKeys = await this.storage.keys();
        console.log('APP: All keys in storage:', allKeys);
      } else {
        console.log('APP: Admin user already exists');
      }

      // Optional profile store for display name/role
      const profiles = (await this.storage.get<Record<string, any>>('profiles')) || {};
      if (!profiles[ADMIN_EMAIL]) {
        profiles[ADMIN_EMAIL] = { displayName: ADMIN_NAME, role: 'admin' };
        await this.storage.set('profiles', profiles);
        console.log('APP: Created admin profile');
      }

      // Determine admin status from current user (case-insensitive)
      const cur = await this.storage.get<any>('currentUser');
      const email = (cur?.email || '').toLowerCase();
      const pass = users[cur?.email] || users[email] || null;
      this.isAdmin = (email === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASS);
      console.log('APP: Initialization complete. Is admin:', this.isAdmin);
    } catch (e) {
      console.error('APP: Error during initialization:', e);
      this.isAdmin = false;
    }
  }
}
