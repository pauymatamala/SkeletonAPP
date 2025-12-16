import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SyncApiPageRoutingModule } from './sync-api-routing.module';
import { SyncApiPage } from './sync-api.page';
import { SyncApiDemoComponent } from '../components/sync-api-demo/sync-api-demo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SyncApiPageRoutingModule,
    SyncApiDemoComponent
  ],
  declarations: [SyncApiPage]
})
export class SyncApiPageModule { }
