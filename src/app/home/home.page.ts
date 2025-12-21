import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AnimationController } from '@ionic/angular';
import { SyncQueryService } from '../core/sync-query.service';
import { AsyncPersistenceService } from '../core/async-persistence.service';
import { CapacitorPluginsService } from '../core/capacitor-plugins.service';
import { Game } from '../models/game.model';

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
  @ViewChild('avatarInput', { read: ElementRef, static: false }) avatarInput!: ElementRef;

  profileImage: string | null = null;

  // IL5: Datos síncronos (consultas rápidas en caché)
  syncGames: Game[] = [];
  syncStats: any = null;

  // IL6: Datos asincónicos con persistencia
  asyncGames$ = this.asyncPersistence.getGamesCached();
  isLoading$ = this.asyncPersistence.getIsLoading();

  // Inyectar AnimationController, servicios de IL5/IL6/IL7
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private animationCtrl: AnimationController,
    private syncQuery: SyncQueryService,
    private asyncPersistence: AsyncPersistenceService,
    private capacitorPlugins: CapacitorPluginsService
  ) {}

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
          storedUsername = parsed?.username ?? null;
          // If username not present, try profiles mapping by email
          if (!storedUsername && parsed?.email) {
            try {
              const profilesRaw = localStorage.getItem('profiles');
              if (profilesRaw) {
                const profiles = JSON.parse(profilesRaw) as Record<string, any>;
                const prof = profiles[parsed.email];
                storedUsername = prof?.displayName ?? null;
              }
            } catch {}
          }
          if (!storedUsername) storedUsername = String(currentUserRaw);
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

    // ============= IL5: Consultas Síncronas =============
    // Obtener datos rápidamente del caché local sin esperar
    this.loadSyncData();

    // ============= IL6: Consultas Asincrónicas con Persistencia =============
    // Cargar datos desde API con persistencia automática
    this.loadAsyncDataWithPersistence();

    // ============= IL7: Plugins de Capacitor =============
    // Configurar feedback háptico y tema
    this.initializeCapacitorPlugins();
  }

  /**
   * IL5: Carga datos síncronos (consultas rápidas en caché)
   */
  private loadSyncData() {
    try {
      // Obtener juegos usando consultas síncronas (muy rápido)
      this.syncGames = this.syncQuery.getAllGamesSync();
      console.log('IL5 - Juegos síncronos cargados:', this.syncGames.length);

      // Obtener estadísticas rápidas
      this.syncStats = this.syncQuery.getStatisticsSync();
      console.log('IL5 - Estadísticas:', this.syncStats);
    } catch (err) {
      console.warn('Error en loadSyncData', err);
    }
  }

  /**
   * IL6: Carga datos asincronos con persistencia automática
   */
  private loadAsyncDataWithPersistence() {
    try {
      // Cargar desde API con fallback a caché
      this.asyncPersistence.getGamesWithPersistence().subscribe({
        next: (games) => {
          console.log('IL6 - Juegos asincónicos cargados:', games.length);
          // Los datos se actualizan automáticamente en asyncGames$
        },
        error: (err) => {
          console.warn('Error en IL6:', err);
          // Ya está manejado por el servicio (retorna caché si hay)
        }
      });
    } catch (err) {
      console.warn('Error en loadAsyncDataWithPersistence', err);
    }
  }

  /**
   * IL7: Inicializa plugins de Capacitor
   */
  private initializeCapacitorPlugins() {
    try {
      if (this.capacitorPlugins.isNativePlatform()) {
        // Configurar tema según preferencia del sistema
        this.capacitorPlugins.setAppTheme('light');

        // Dar feedback háptico al cargar la página
        this.capacitorPlugins.hapticImpactLight();

        console.log('IL7 - Plugins de Capacitor inicializados');
      }
    } catch (err) {
      console.warn('Error en initializeCapacitorPlugins', err);
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
    // IL7: Feedback háptico antes de logout
    this.capacitorPlugins.feedbackSuccess();
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

    // leer imagen de perfil desde localStorage (si existe)
    try {
      const u = localStorage.getItem('currentUser');
      if (u) {
        const parsed = JSON.parse(u);
        this.profileImage = parsed?.image || parsed?.avatar || null;
      } else {
        this.profileImage = null;
      }
    } catch (err) {
      this.profileImage = null;
    }
  }

  openFilePicker() {
    try {
      if (this.avatarInput && this.avatarInput.nativeElement) {
        this.avatarInput.nativeElement.click();
      }
    } catch (e) {
      console.error('No se pudo abrir el selector de archivos', e);
    }
  }

  onFileSelected(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.profileImage = dataUrl;
        try {
          const cur = localStorage.getItem('currentUser');
          let obj: any = cur ? JSON.parse(cur) : {};
          obj.image = dataUrl;
          localStorage.setItem('currentUser', JSON.stringify(obj));
          // pequeña animación de feedback en el avatar
          this.animateAvatarPulse();
          // IL7: Feedback háptico al seleccionar avatar
          this.capacitorPlugins.feedbackButtonClick();
        } catch (err) {
          // aún así intentamos animar avatar
          this.animateAvatarPulse();
          // ignore storage errors
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Error leyendo archivo', e);
    }
  }

  /**
   * animateAvatarPulse: animación breve para dar feedback cuando el avatar cambia.
   */
  private animateAvatarPulse() {
    try {
      const el = document.querySelector('app-profile-avatar');
      if (!el) return;
      const a = this.animationCtrl.create()
        .addElement(el)
        .duration(420)
        .easing('cubic-bezier(.2,.8,.2,1)')
        .keyframes([
          { offset: 0, transform: 'scale(1)' },
          { offset: 0.5, transform: 'scale(1.08)' },
          { offset: 1, transform: 'scale(1)' }
        ]);
      a.play();
    } catch (e) {
      // ignore animation errors
    }
  }

  goHome() {
    try {
      this.router.navigate(['/home']);
    } catch (e) {
      // ignore
    }
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
