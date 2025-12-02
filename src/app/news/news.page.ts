import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../core/database.service';
import { News } from '../models/news.model';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss']
})
export class NewsPage implements OnInit {
  form: FormGroup;
  items: News[] = [];
  loading = true;

  constructor(private fb: FormBuilder, private db: DatabaseService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    await this.db.init();
    this.db.ready$.subscribe(async ready => {
      if (ready) await this.load();
    });
  }

  async load() {
    this.loading = true;
    this.items = await this.db.getAllNews();
    this.loading = false;
  }

  async add() {
    if (this.form.invalid) return;
    const val = this.form.value as News;
    await this.db.addNews({ title: val.title, content: val.content });
    this.form.reset();
    await this.load();
  }

  async remove(id?: number) {
    if (!id) return;
    await this.db.deleteNews(id);
    await this.load();
  }
}
