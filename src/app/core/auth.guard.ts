import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private storage: StorageService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const cur = await this.storage.get<any>('currentUser');
    if (!cur || !cur.email) {
      this.router.navigate(['/login']);
      return false;
    }
    const email = String(cur.email);
    const users = (await this.storage.get<Record<string, string>>('users')) || {};
    const exists = !!(users[email] ?? users[email.toLowerCase()]);
    if (!exists) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
