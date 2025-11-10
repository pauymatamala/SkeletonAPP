import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
  genero: string | null = null;
  telefono: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Primero intentar leer NavigationExtras (forma "oficial")
  const nav = this.router.getCurrentNavigation ? this.router.getCurrentNavigation() : null;
  const navState = nav && (nav.extras?.state as any | undefined);
    if (navState) {
      console.log('Home init - navigation extras state via Router.getCurrentNavigation():', navState);
    }

    // backup: history.state (por si la navegación vino desde fuera del router o reload)
    const historyState = history.state as any;
    if (historyState) {
      console.log('Home init - history.state:', historyState);
    }

    // intentar obtener username desde navigation extras -> history.state -> localStorage
    const currentUserRaw = localStorage.getItem('currentUser');
    console.log('Home init - raw currentUser from localStorage:', currentUserRaw);
    let storedUsername: string | null = null;
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw);
        storedUsername = parsed?.username ?? String(currentUserRaw);
      } catch {
        storedUsername = currentUserRaw;
      }
    }

    this.username = navState?.username ?? historyState?.username ?? storedUsername;

    // intentar cargar datos temporales guardados en sessionStorage (desde Registrar)
    const temp = sessionStorage.getItem('tempRegistration');
    if (temp) {
      try {
        const t = JSON.parse(temp);
        this.nombre = t?.nombre ?? null;
        this.username = t?.username ?? this.username;
        this.nacimiento = t?.nacimiento ?? null;
        this.email = t?.email ?? null;
  this.genero = t?.genero ?? null;
  this.telefono = t?.telefono ?? null;
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
