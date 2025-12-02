import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ProfileAvatarComponent } from './profile-avatar/profile-avatar.component';

@NgModule({
	declarations: [ProfileAvatarComponent],
	imports: [CommonModule, IonicModule, RouterModule],
	exports: [ProfileAvatarComponent]
})
export class SharedModule {}
