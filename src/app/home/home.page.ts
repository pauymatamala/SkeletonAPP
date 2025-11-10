import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  // no es componente standalone — se declara en HomePageModule
})
export class HomePage implements OnInit {

  username: string | null = null;
  nombre: string | null = null;
  email: string | null = null;
  nacimiento: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const state = history.state as any;
    // intentar obtener username desde navigation state o localStorage
    const currentUserRaw = localStorage.getItem('currentUser');
    let storedUsername: string | null = null;
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw);
        storedUsername = parsed?.username ?? String(currentUserRaw);
      } catch {
        storedUsername = currentUserRaw;
      }
    }
    this.username = state?.username ?? storedUsername;

    // intentar cargar datos temporales guardados en sessionStorage (desde Registrar)
    const temp = sessionStorage.getItem('tempRegistration');
    if (temp) {
      try {
        const t = JSON.parse(temp);
        this.nombre = t?.nombre ?? null;
        this.username = t?.username ?? this.username;
        this.nacimiento = t?.nacimiento ?? null;
        this.email = t?.email ?? null;
      } catch (e) {
        // ignore parse errors
      }
    }
  }

  handleScrollStart() {
    console.log('scroll start');
  }

  handleScroll(ev: any) {
    const top = ev?.detail?.scrollTop ?? 0;
    // ejemplo: puedes usar top para disparar animaciones
    console.log('scroll pos', top);
  }

  handleScrollEnd() {
    console.log('scroll end');
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigateByUrl('/login');
  }
}
