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
    try {
      await this.database.init();
    } catch (err) {
      console.warn('Database init failed on app start', err);
    }

    try {
      const cur = await this.storage.get<any>('currentUser');
      const users = await this.storage.get<Record<string, string>>('users');
      const email = cur?.email;
      const pass = users?.[email];
      this.isAdmin = (email === 'admin@gmail.com' && pass === 'Prueba123');
    } catch (e) {
      this.isAdmin = false;
    }
  }
}
