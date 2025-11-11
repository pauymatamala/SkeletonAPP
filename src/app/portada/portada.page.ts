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

  // ejemplo de catálogo (local, sin imágenes externas)
  games = [
    { id: 'g1', title: 'Shadow Quest', price: '$29.990', tag: 'RPG' },
    { id: 'g2', title: 'Speed Racer X', price: '$19.990', tag: 'Racing' },
    { id: 'g3', title: 'Battlefront Legends', price: '$49.990', tag: 'Action' },
    { id: 'g4', title: 'Mystic Farms', price: '$9.990', tag: 'Casual' }
  ];

  // lista de categorías para mostrar en la portada (en español)
  categories = ['Acción', 'RPG', 'Carreras', 'Casual', 'Indie', 'Estrategia', 'Aventura', 'Deportes', 'Simulación'];

  constructor(private animationCtrl: AnimationController, private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  

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
      // elemento DOM (puede venir como HTMLButtonElement o div)
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
    // small delay to allow the click feedback to be visible
    setTimeout(() => {
      this.router.navigate(['/categorias'], { state: { category }, queryParams: { category } });
    }, 60);
  }

}
