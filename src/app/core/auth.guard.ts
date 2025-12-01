import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private storage: StorageService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await this.storage.get('currentUser');
    if (user) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
