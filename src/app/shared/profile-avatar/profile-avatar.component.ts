import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.scss']
})
export class ProfileAvatarComponent {
  @Input() src: string | null = null;
  @Input() size = 36;
  @Input() alt = 'Perfil';
  @Input() routerLink?: string;
  @Output() clicked = new EventEmitter<void>();

  fallback = 'https://picsum.photos/seed/avatar/200/200';

  constructor(private router: Router) {}

  onClick() {
    this.clicked.emit();
    if (this.routerLink) {
      this.router.navigate([this.routerLink]);
    }
  }

  onImgError(ev: Event) {
    try {
      const img = ev.target as HTMLImageElement;
      if (img) { img.src = this.fallback; }
    } catch (e) {
      // ignore
    }
  }
}
