import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AnimationController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService } from '../core/database.service';
import { Category } from '../models/category.model';
import { Game } from '../models/game.model';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: false
})
export class CategoriasPage implements OnInit {

  @ViewChild('catTitle', { read: ElementRef, static: false }) catTitle!: ElementRef;
  @ViewChildren('catCard', { read: ElementRef }) catCards!: QueryList<ElementRef>;
  // texto de la categoría seleccionada
  selectedCategory: string | null = null;

  // término de búsqueda para filtrar juegos
  // Texto ingresado en la barra de búsqueda. Se usa para filtrar los juegos mostrados.
  searchTerm: string = '';
  // inyectar router y controlador de animaciones
  /**
   * Constructor: inyecta controladores de animación, navegación y loading de Ionic.
   * LoadingController se usa para mostrar un indicador breve cuando el usuario selecciona una categoría.
   */
  constructor(private animationCtrl: AnimationController, private router: Router, private loadingCtrl: LoadingController, private db: DatabaseService) { }

  ngOnInit() {
  }

  /**
   * animateGamesEntrance: aplica una animación en cascada (stagger) a las tarjetas
   * dentro de `.games-grid` para mejorar la percepción cuando aparecen los juegos.
   */
  animateGamesEntrance() {
    try {
      const cards = Array.from(document.querySelectorAll('.games-grid ion-card')) as HTMLElement[];
      if (!cards || cards.length === 0) return;
      cards.forEach((card, i) => {
        try {
          const a = this.animationCtrl.create()
            .addElement(card)
            .duration(360)
            .easing('cubic-bezier(.2,.8,.2,1)')
            .fromTo('opacity', '0', '1')
            .fromTo('transform', 'translateY(12px)', 'translateY(0)');
          setTimeout(() => a.play(), i * 80);
        } catch (err) {
          // ignore
        }
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * ionViewDidEnter: inicializa la vista cada vez que la página entra en primer plano.
   * - Recupera una categoría pasada por `NavigationExtras.state` (si existe)
   * - Reproduce la animación del título
   * - Revela las tarjetas de categoría con animación escalonada
   * - Carga la lista de juegos de la categoría seleccionada (si aplica)
   * - Recupera la imagen de perfil desde localStorage (demo)
   */

  ionViewDidEnter() {
    // leer category desde navigation state (fallback a null)
    try {
      const nav = this.router.getCurrentNavigation();
      const st = (nav && nav.extras && (nav.extras.state as any)) || (history && history.state) || {};
      this.selectedCategory = st.category || null;
    } catch (e) {
      this.selectedCategory = null;
    }

    // animación del título
    try {
      if (this.catTitle && this.catTitle.nativeElement) {
        const anim = this.animationCtrl.create()
          .addElement(this.catTitle.nativeElement)
          .duration(500)
          .easing('cubic-bezier(0.36,0.66,0.04,1)')
          .fromTo('opacity', '0', '1')
          .fromTo('transform', 'translateY(12px)', 'translateY(0)');
        anim.play();
      }
    } catch (e) {
      // ignore
    }

  // revelar las tarjetas de categorías en forma escalonada
    setTimeout(() => {
      const cards = this.catCards ? this.catCards.toArray() : [];
      cards.forEach((c, i) => {
        try {
          const el = c.nativeElement as HTMLElement;
          el.classList.remove('hidden');
          const a = this.animationCtrl.create()
            .addElement(el)
            .duration(420)
            .easing('cubic-bezier(.2,.8,.2,1)')
            .fromTo('opacity', '0', '1')
            .fromTo('transform', 'translateY(18px)', 'translateY(0)');
          setTimeout(() => a.play(), i * 90);
        } catch (err) {
          // ignore
        }
      });
    }, 220);

    // cargar categorías y juegos desde DatabaseService
    this.loadCategoriesAndMaybeGames();

    // leer imagen de perfil guardada en localStorage (si existe)
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

  /**
   * filterDisplayedGames: filtra `displayedGames` usando `searchTerm`.
   * - Si no hay término o no hay categoría seleccionada, restaura la lista completa.
   * - Filtrado sencillo por coincidencia en el título (case-insensitive).
   * Nota: para listas grandes conviene añadir debounce o filtrado en backend.
   */
  filterDisplayedGames() {
    if (!this.searchTerm) return;
    const term = this.searchTerm.toLowerCase();
    this.displayedGames = (this.displayedGames || []).filter(g => (g.title || '').toLowerCase().includes(term));
  }

  /**
   * doRefresh: manejador para `ion-refresher`.
   * Simula la recarga de contenido y completa el refresher cuando termina.
   * En un escenario real reemplazar `setTimeout` por la llamada a la API.
   */
  doRefresh(event: any) {
    setTimeout(() => {
      if (this.selectedCategory) {
        this.displayedGames = this.gamesByCategory[this.selectedCategory] || [];
      }
      event.detail.complete();
    }, 700);
  }

  // placeholder until loaded from DB
  gamesByCategory: Record<string, any[]> = {};


  /**
   * onImgError: fallback para imágenes que fallen al cargar.
   * Reemplaza la imagen rota por un placeholder remoto (demo).
   * En producción conviene usar assets locales para evitar CORS/expiración.
   */
  onImgError(ev: Event) {
    try {
      const img = ev.target as HTMLImageElement;
      if (img) {
        img.src = 'https://picsum.photos/seed/placeholder/640/360';
      }
    } catch (e) {
      // ignore
    }
  }
  displayedGames: any[] = [];

  // imagen de perfil para el avatar (se lee de localStorage si existe)
  profileImage: string | null = null;

  // lista de categorías (coincide con portada)
  categories: string[] = [];

  // Mapa de imágenes por categoría. No rellenado por defecto.
  // Cuando me proporciones la URL directa de la imagen (o la subas a assets),
  // asigna la ruta aquí (por ejemplo: 'assets/games/drift.jpg' o la URL directa).
  categoryImages: Record<string, string> = {
    'Acción': 'https://cdn.cloudflare.steamstatic.com/steam/apps/2566580/capsule_616x353.jpg?t=1700782083',
    'RPG': 'https://cdn.cloudflare.steamstatic.com/steam/apps/1517290/capsule_616x353.jpg?t=1698192043',
    'Carreras': 'https://play-lh.googleusercontent.com/HXoSbz87wD8eUFnDkBKoQfe5oeo8HZXEsnQfYCNREy_tsqHheVcT6dKcUaXpSE2r6Q=w526-h296-rw',
    'Casual': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYRIb5Pli6ZSiOG0QJqlAjBLkCKnkGohdh6w&s',
    'Indie': 'https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2020/12/juegos-indie-esperados-2021-2183387.jpg?tf=3840x',
    'Estrategia': 'https://cdn.ligadegamers.com/imagenes/mejores-juegos-estrategia-pc-og.jpg',
    'Aventura': 'https://i.blogs.es/ab965a/nintendoswitch_tlozbreathofthewild_artwork_illustration_01.0/1366_2000.jpeg',
    'Deportes': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfygtOUkY_DgIyl2JMUcX7KqSmXVcsIOXC_w&s',
    'Simulación': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAZozfN-a8mhYT-K-bpBO1enJPBAkptVI87Q&s'
  
  };

  /**
   * tapCategory: efecto al tocar una categoría.
   * - Ejecuta una animación de feedback (scale + sombra)
   * - Marca la categoría como seleccionada
   * - Muestra un `ion-loading` breve mientras se cargan los juegos
   */
  async tapCategory(cat: string, el: any) {
    try {
      const element = (el as HTMLElement) || null;
      if (element) {
        const anim = this.animationCtrl.create()
          .addElement(element)
          .duration(180)
          .easing('cubic-bezier(.2,.8,.2,1)')
          .fromTo('transform', 'scale(1)', 'scale(0.96)')
          .fromTo('boxShadow', '0 0 0 rgba(0,0,0,0)', '0 12px 40px rgba(2,6,23,0.45)');
        await anim.play();
      }
    } catch (e) {
      // ignore
    }
    // mantener seleccionado y (opcional) filtrar o navegar
    this.selectedCategory = cat;
    // mostrar loading breve mientras cargamos los juegos
    try {
      const loader = await this.loadingCtrl.create({ message: 'Cargando juegos...' });
      await loader.present();
      // simular carga y asignar
      setTimeout(async () => {
        // cargar juegos desde la base
        this.displayedGames = await this.db.getGamesByCategory(cat) || [];
        await loader.dismiss();
        // dar un tick para que Angular renderice la sección y luego desplazar suavemente
        setTimeout(() => {
          try {
            const el = document.querySelector('.games-title');
            if (el) {
              (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (err) {
            // ignore scrolling errors
          }
          // luego reproducir animación en cascada de las tarjetas de juego
          this.animateGamesEntrance();
        }, 80);
      }, 600);
    } catch (e) {
      // fallback sin loader (usar `cat` que siempre es un string válido aquí)
      this.displayedGames = this.gamesByCategory[cat] || [];
    }
  }

  /**
   * goHome: navegación programática a la página `home`.
   * Usado por el avatar cuando el usuario quiere regresar al inicio.
   */
  goHome() {
    try {
      this.router.navigate(['/home'], { state: { from: 'categorias' } });
    } catch (e) {
      // ignore
    }
  }

  // Load categories and games if needed
  private async loadCategoriesAndMaybeGames() {
    try {
      const cats = await this.db.getCategories();
      this.categories = (cats || []).map(c => c.name);
      if (this.selectedCategory) {
        this.displayedGames = await this.db.getGamesByCategory(this.selectedCategory);
      } else {
        this.displayedGames = [];
      }
    } catch (err) {
      // if DB fails, fallback to existing dataset if any
      if (!this.categories || this.categories.length === 0) {
        this.categories = Object.keys(this.gamesByCategory || {});
      }
      this.displayedGames = [];
    }
  }

}
