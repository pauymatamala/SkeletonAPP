import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AnimationController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portada',
  templateUrl: './portada.page.html',
  styleUrls: ['./portada.page.scss'],
  standalone: false,
})
export class PortadaPage implements OnInit {

  @ViewChild('heroTitle', { read: ElementRef, static: false }) heroTitle!: ElementRef;

  searchForm: FormGroup;

  // ejemplo de catálogo (local, con imágenes de placeholder para mostrar `ion-img`)
  games = [
    { id: 'g1', title: 'Shadow Quest', price: '$29.990', tag: 'RPG', image: 'https://picsum.photos/seed/shadow/640/360' },
    { id: 'g2', title: 'Speed Racer X', price: '$19.990', tag: 'Racing', image: 'https://picsum.photos/seed/speed/640/360' },
    { id: 'g3', title: 'Battlefront Legends', price: '$49.990', tag: 'Action', image: 'https://picsum.photos/seed/battle/640/360' },
    { id: 'g4', title: 'Mystic Farms', price: '$9.990', tag: 'Casual', image: 'https://picsum.photos/seed/mystic/640/360' }
  ];

  // (Se eliminó la visualización inline de categorías; la navegación volverá a /categorias)

  // dataset por categoría (usado para rellenar displayedGames al seleccionar categoría)
  gamesByCategory: Record<string, any[]> = {
    'Acción': [
      { id: 'a1', title: 'Shadow Quest', price: '$29.990', image: 'https://picsum.photos/seed/a1/640/360' },
      { id: 'a2', title: 'Night Blades', price: '$39.990', image: 'https://picsum.photos/seed/a2/640/360' },
      { id: 'a3', title: 'Rogue Storm', price: '$24.990', image: 'https://picsum.photos/seed/a3/640/360' },
      { id: 'a4', title: 'Final War', price: '$49.990', image: 'https://picsum.photos/seed/a4/640/360' },
      { id: 'a5', title: 'Heroic Dawn', price: '$19.990', image: 'https://picsum.photos/seed/a5/640/360' }
    ],
    'RPG': [
      { id: 'r1', title: 'Eternal Saga', price: '$34.990', image: 'https://picsum.photos/seed/r1/640/360' },
      { id: 'r2', title: 'Dungeon Keep', price: '$22.990', image: 'https://picsum.photos/seed/r2/640/360' },
      { id: 'r3', title: 'Sword & Soul', price: '$44.990', image: 'https://picsum.photos/seed/r3/640/360' },
      { id: 'r4', title: 'Legends of Mira', price: '$39.990', image: 'https://picsum.photos/seed/r4/640/360' },
      { id: 'r5', title: 'Crystal Forge', price: '$27.990', image: 'https://picsum.photos/seed/r5/640/360' }
    ],
    'Carreras': [
      { id: 'c1', title: 'Speed Racer X', price: '$19.990', image: 'https://picsum.photos/seed/c1/640/360' },
      { id: 'c2', title: 'Turbo Drift', price: '$24.990', image: 'https://picsum.photos/seed/c2/640/360' },
      { id: 'c3', title: 'Neon Circuit', price: '$29.990', image: 'https://picsum.photos/seed/c3/640/360' },
      { id: 'c4', title: 'Urban Rush', price: '$14.990', image: 'https://picsum.photos/seed/c4/640/360' },
      { id: 'c5', title: 'Track Master', price: '$34.990', image: 'https://picsum.photos/seed/c5/640/360' }
    ],
    'Casual': [
      { id: 'cs1', title: 'Mystic Farms', price: '$9.990', image: 'https://picsum.photos/seed/cs1/640/360' },
      { id: 'cs2', title: 'Tile Match', price: '$4.990', image: 'https://picsum.photos/seed/cs2/640/360' },
      { id: 'cs3', title: 'Bubble Pop', price: '$6.990', image: 'https://picsum.photos/seed/cs3/640/360' },
      { id: 'cs4', title: 'Garden Joy', price: '$7.990', image: 'https://picsum.photos/seed/cs4/640/360' },
      { id: 'cs5', title: 'Snack Time', price: '$3.990', image: 'https://picsum.photos/seed/cs5/640/360' }
    ]
  };

  // lista de categorías para mostrar en la portada (en español)
  categories = ['Acción', 'RPG', 'Carreras', 'Casual', 'Indie', 'Estrategia', 'Aventura', 'Deportes', 'Simulación'];

  constructor(private animationCtrl: AnimationController, private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  profileImage: string | null = null;

  

  ngOnInit() {
  }

  ionViewDidEnter() {
    // animación del título: fade-in + slide
    try {
      if (this.heroTitle && this.heroTitle.nativeElement) {
        const anim = this.animationCtrl.create()
          .addElement(this.heroTitle.nativeElement)
          .duration(700)
          .easing('cubic-bezier(0.36,0.66,0.04,1)')
          .fromTo('opacity', '0', '1')
          .fromTo('transform', 'translateY(20px)', 'translateY(0)');
        anim.play();
      }
    } catch (e) {
      // ignore
    }

    // revelar las tarjetas con pequeño delay
    setTimeout(() => {
      const cards = document.querySelectorAll('.cards .card');
      cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('visible'), i * 80);
      });
    }, 150);

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

  goHome() {
    try {
      this.router.navigate(['/home']);
    } catch (e) {
      // ignore
    }
  }

  onSearch() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const q = this.searchForm.value.query;
    // navegar a /home como ejemplo pasando query via state y queryParams
    this.router.navigate(['/home'], { state: { search: q }, queryParams: { search: q } });
  }

  openGame(game: any) {
    // navegar a home (por ejemplo) pasando el id del juego
    this.router.navigate(['/home'], { state: { gameId: game.id, title: game.title }, queryParams: { gameId: game.id } });
  }

  // al abrir una categoría, reproducir una micro-animación en el elemento y luego navegar a /categorias
  async openCategory(category: string, el: any) {
    try {
      const target = el || null;
      if (target) {
        const a = this.animationCtrl.create()
          .addElement(target)
          .duration(160)
          .easing('cubic-bezier(0.2,0.8,0.2,1)')
          .fromTo('transform', 'scale(1)', 'scale(0.96)')
          .fromTo('boxShadow', '0 0 0 rgba(0,0,0,0)', '0 6px 18px rgba(0,0,0,0.2)');
        await a.play();
      }
    } catch (e) {
      // ignore animation errors
    }

    // Navegar a la página de categorías pasando la categoría seleccionada
    try {
      this.router.navigate(['/categorias'], { state: { category }, queryParams: { category } });
    } catch (e) {
      console.error('Error navegando a /categorias', e);
    }
  }

}
