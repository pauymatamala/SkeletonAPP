import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AnimationController } from '@ionic/angular';

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

  @ViewChild('welcomeTitle', { read: ElementRef, static: false }) welcomeTitle!: ElementRef;

  // Inyectar AnimationController para animaciones Ionic
  constructor(private router: Router, private route: ActivatedRoute, private animationCtrl: AnimationController) {}

  ngOnInit() {
    // 1) Intentar NavigationExtras (state) — forma preferida cuando la navegación viene de la app
    const nav = this.router.getCurrentNavigation ? this.router.getCurrentNavigation() : null;
    const navState = nav && (nav.extras?.state as any | undefined);
    if (navState?.username) {
      this.username = navState.username;
    }

    // 2) Fallback: history.state (por si la navegación vino desde fuera del router o hubo reload)
    if (!this.username && (history.state as any)?.username) {
      this.username = (history.state as any).username;
    }

    // 3) Fallback adicional: queryParams vía ActivatedRoute (cumple con lectura a través de ActivatedRoute)
    if (!this.username) {
      this.route.queryParams.subscribe(params => {
        if (params && params['username']) {
          this.username = params['username'];
        }
      });
    }

    // 4) Backup final: localStorage (persistencia entre recargas)
    if (!this.username) {
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
      this.username = storedUsername;
    }

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

  // Ionic lifecycle hook ejecutado cuando la vista ya está activa
  ionViewDidEnter() {
    // activar CSS transition
    try {
      if (this.welcomeTitle && this.welcomeTitle.nativeElement) {
        this.welcomeTitle.nativeElement.classList.add('visible');
      }
    } catch (e) {
      // ignore
    }

    // también reproducir animación Ionic como fallback
    this.playTitleAnimation();
  }

  private async playTitleAnimation() {
    try {
      if (!this.welcomeTitle || !this.welcomeTitle.nativeElement) return;
      const anim = this.animationCtrl.create()
        .addElement(this.welcomeTitle.nativeElement)
        .duration(600)
        .easing('cubic-bezier(0.36,0.66,0.04,1)')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(20px)', 'translateY(0)');

      await anim.play();
    } catch (e) {
      // no bloquear la app si la animación falla
      console.warn('Animation failed', e);
    }
  }
}
