import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SyncApiPageRoutingModule } from './sync-api-routing.module';
import { SyncApiPage } from './sync-api.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SyncApiPageRoutingModule,
    SyncApiPage
  ]
})
export class SyncApiPageModule { }
