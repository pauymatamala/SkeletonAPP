import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../core/database.service';

@Component({
  selector: 'app-news-detail',
  
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalle Noticia</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="item">
        <h2>{{ item.title }}</h2>
        <p>{{ item.content }}</p>
        <small>{{ item.date }}</small>
      </div>
      <div *ngIf="!item">Cargando...</div>
    </ion-content>
  `
})
export class NewsDetailPage implements OnInit {
  item: any = null;

  constructor(private route: ActivatedRoute, private db: DatabaseService) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const all = await this.db.getAllNews();
    this.item = (all || []).find((n: any) => String(n.id) === String(id)) || null;
  }
}
