import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AnimationController } from '@ionic/angular';
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
  selectedCategory: string | null = null;

  constructor(private animationCtrl: AnimationController, private router: Router) { }

  ngOnInit() {
  }

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
      { id: 'c1', title: 'Speed Racer X', price: '$19.990' },
      { id: 'c2', title: 'Turbo Drift', price: '$24.990' },
      { id: 'c3', title: 'Neon Circuit', price: '$29.990' },
      { id: 'c4', title: 'Urban Rush', price: '$14.990' },
      { id: 'c5', title: 'Track Master', price: '$34.990' }
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

  displayedGames: any[] = [];

  // lista de categorías (coincide con portada)
  categories = ['Acción', 'RPG', 'Carreras', 'Casual', 'Indie', 'Estrategia', 'Aventura', 'Deportes', 'Simulación'];

  // animación de feedback al seleccionar una categoría
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
    // actualizar lista mostrada
    this.displayedGames = this.gamesByCategory[this.selectedCategory] || [];
  }
}
