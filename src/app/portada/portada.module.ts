import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PortadaPageRoutingModule } from './portada-routing.module';

import { PortadaPage } from './portada.page';
import { MaterialModule } from '../material.module';
import { ProfileAvatarComponent } from '../shared/profile-avatar/profile-avatar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
    PortadaPageRoutingModule,
    ProfileAvatarComponent
  ],
  declarations: [PortadaPage]
})
export class PortadaPageModule {}
