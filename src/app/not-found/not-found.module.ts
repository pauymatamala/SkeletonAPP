import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NotFoundPage } from './not-found.page';
import { NotFoundRoutingModule } from './not-found-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, NotFoundRoutingModule],
  declarations: [NotFoundPage]
})
export class NotFoundPageModule {}
