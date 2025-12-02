import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NewsDetailPage } from './news-detail.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NewsDetailPage,
    RouterModule.forChild([{ path: '', component: NewsDetailPage }])
  ]
})
export class NewsDetailModule {}
