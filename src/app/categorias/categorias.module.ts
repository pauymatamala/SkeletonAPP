import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriasPageRoutingModule } from './categorias-routing.module';

import { CategoriasPage } from './categorias.page';
import { ProfileAvatarComponent } from '../shared/profile-avatar/profile-avatar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriasPageRoutingModule,
    // importar componente standalone del avatar
    ProfileAvatarComponent
  ],
  declarations: [CategoriasPage]
})
export class CategoriasPageModule {}
