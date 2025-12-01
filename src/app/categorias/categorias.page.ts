import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AnimationController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

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
  constructor(private animationCtrl: AnimationController, private router: Router, private loadingCtrl: LoadingController) { }

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

    // cargar juegos por categoría si vino en el state o si tenemos selección previa
    try {
      if (this.selectedCategory) {
        this.displayedGames = this.gamesByCategory[this.selectedCategory] || [];
      } else {
        this.displayedGames = [];
      }
    } catch (e) {
      this.displayedGames = [];
    }

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
    if (!this.searchTerm || !this.selectedCategory) {
      this.displayedGames = this.selectedCategory ? this.gamesByCategory[this.selectedCategory] || [] : [];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    const all = this.gamesByCategory[this.selectedCategory] || [];
    this.displayedGames = all.filter(g => (g.title || '').toLowerCase().includes(term));
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

  // --- Mostrar 5 juegos por categoría (dataset local, demo) ---
  gamesByCategory: Record<string, any[]> = {
    'Acción': [
      { id: 'a1', title: 'Shadow Quest', price: '$29.990' },
      { id: 'a2', title: 'Night Blades', price: '$39.990' },
      { id: 'a3', title: 'Rogue Storm', price: '$24.990' },
      { id: 'a4', title: 'Final War', price: '$49.990' },
      { id: 'a5', title: 'Heroic Dawn', price: '$19.990' }
    ],
    'RPG': [
      { id: 'r1', title: 'Eternal Saga', price: '$34.990' },
      { id: 'r2', title: 'Dungeon Keep', price: '$22.990' },
      { id: 'r3', title: 'Sword & Soul', price: '$44.990' },
      { id: 'r4', title: 'Legends of Mira', price: '$39.990' },
      { id: 'r5', title: 'Crystal Forge', price: '$27.990' }
    ],
    'Carreras': [
      { id: 'c1', title: 'Speed Racer X', price: '$19.990', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRTEwvq1ygvThBZHx4cNZ3dU1zd_knXuiEbQ&s' },
      { id: 'c2', title: 'Turbo Drift', price: '$24.990', image: 'https://play-lh.googleusercontent.com/px4Ni6wy5yei9_iOvX3Nl2ec-ACl_icJlm6uGGTcb_1CAwPneg7P8zfK2oTIL2iX-ii_=w526-h296-rw' },
      { id: 'c3', title: 'Neon Circuit', price: '$29.990', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrHoUR_zzBBCuinJ12e_peUXeeSnHLoG-icA&s' },
      { id: 'c4', title: 'Urban Rush', price: '$14.990', Image: 'https://play-lh.googleusercontent.com/sSZXgNbHoSVNYmzWsJ8oXkAwTWqbQQItexwtCDtBaINLi_NqdFpyMRI2v4waZvm_4Kc=w240-h480-rw' },
      { id: 'c5', title: 'Track Master', price: '$34.990', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPkCs8at7s4jfnbyqtKPwHpW00GgUK8NiRog&s' }
    ],
    'Casual': [
      { id: 'cs1', title: 'Mystic Farms', price: '$9.990' },
      { id: 'cs2', title: 'Tile Match', price: '$4.990' },
      { id: 'cs3', title: 'Bubble Pop', price: '$6.990' },
      { id: 'cs4', title: 'Garden Joy', price: '$7.990' },
      { id: 'cs5', title: 'Snack Time', price: '$3.990' }
    ],
    'Indie': [
      { id: 'i1', title: 'Paper Tales', price: '$12.990' },
      { id: 'i2', title: 'Low Poly Hero', price: '$9.990' },
      { id: 'i3', title: 'Silent Steps', price: '$14.990' },
      { id: 'i4', title: 'Echoes', price: '$11.990' },
      { id: 'i5', title: 'Dreamwalk', price: '$8.990' }
    ],
    'Estrategia': [
      { id: 's1', title: 'Kingdom Minds', price: '$29.990' },
      { id: 's2', title: 'War Council', price: '$34.990' },
      { id: 's3', title: 'Tactical Edge', price: '$24.990' },
      { id: 's4', title: 'Colony Builder', price: '$39.990' },
      { id: 's5', title: 'Grid Lords', price: '$19.990' }
    ],
    'Aventura': [
      { id: 'av1', title: 'Lost Valley', price: '$22.990' },
      { id: 'av2', title: 'Isle Explorers', price: '$18.990' },
      { id: 'av3', title: 'Cave Runner', price: '$16.990' },
      { id: 'av4', title: 'Skybound', price: '$24.990' },
      { id: 'av5', title: 'Night Voyage', price: '$21.990' }
    ],
    'Deportes': [
      { id: 'd1', title: 'Pro Soccer 21', price: '$39.990' },
      { id: 'd2', title: 'Rally Champions', price: '$29.990' },
      { id: 'd3', title: 'Hoops League', price: '$19.990' },
      { id: 'd4', title: 'Skate Pro', price: '$14.990' },
      { id: 'd5', title: 'Extreme BMX', price: '$17.990' }
    ],
    'Simulación': [
      { id: 'sm1', title: 'Flight Sim X', price: '$49.990' },
      { id: 'sm2', title: 'City Architect', price: '$29.990' },
      { id: 'sm3', title: 'Farm Life 3', price: '$24.990' },
      { id: 'sm4', title: 'Train Ops', price: '$19.990' },
      { id: 'sm5', title: 'Garage Builder', price: '$9.990' }
    ]
  };


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
  categories = ['Acción', 'RPG', 'Carreras', 'Casual', 'Indie', 'Estrategia', 'Aventura', 'Deportes', 'Simulación'];

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
        // Usar la variable `cat` (parámetro) en vez de `this.selectedCategory`
        // así evitamos problemas de tipo dentro del callback asincrónico.
        this.displayedGames = this.gamesByCategory[cat] || [];
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

}
