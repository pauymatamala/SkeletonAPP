import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../core/database.service';

@Component({
  selector: 'app-news-new',
  
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nueva Noticia</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="save()">
        <ion-item>
          <ion-label position="floating">Título</ion-label>
          <ion-input formControlName="title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Contenido</ion-label>
          <ion-textarea formControlName="content"></ion-textarea>
        </ion-item>
        <ion-button expand="block" type="submit" [disabled]="form.invalid">Guardar</ion-button>
      </form>
    </ion-content>
  `
})
export class NewsNewPage {
  form: FormGroup;

  constructor(private fb: FormBuilder, private db: DatabaseService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async save() {
    if (this.form.invalid) return;
    const val = this.form.value;
    await this.db.addNews({ title: val.title, content: val.content });
    // navigate back
    try { history.back(); } catch (e) {}
  }
}
