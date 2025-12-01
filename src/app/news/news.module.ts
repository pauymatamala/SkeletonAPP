import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsPage } from './news.page';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: NewsPage,
        children: [
          { path: 'new', loadComponent: () => import('./news-new.page').then(m => m.NewsNewPage) },
          { path: ':id', loadComponent: () => import('./news-detail.page').then(m => m.NewsDetailPage) }
        ]
      }
    ])
  ]
})
export class NewsPageModule {}
