import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewsPage } from './news.page';
import { NewsNewPage } from './news-new.page';
import { NewsDetailPage } from './news-detail.page';

@NgModule({
  declarations: [NewsDetailPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    NewsPage,
    NewsNewPage,
    RouterModule.forChild([
      {
        path: '',
        component: NewsPage,
        children: [
          { path: 'new', component: NewsNewPage },
          { path: ':id', component: NewsDetailPage }
        ]
      }
    ])
  ]
})
export class NewsPageModule {}
