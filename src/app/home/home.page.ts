import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  username: string | null = null;

  constructor() {}

  ngOnInit() {
    // Obtener el estado pasado desde la navegación (login)
    const state = history.state as any;
    if (state && state.username) {
      this.username = state.username;
    }
  }

}
