import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  username: string | null = null;
  router: any;

  constructor() {}

  ngOnInit() {
    const state = history.state as any;
    this.username = state?.username ?? localStorage.getItem('currentUser');
  }
  logout() {
  localStorage.removeItem('currentUser');
  this.router.navigateByUrl('/login');
  }
}
