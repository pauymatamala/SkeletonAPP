import { Component } from '@angular/core';
import { SyncApiDemoComponent } from '../components/sync-api-demo/sync-api-demo.component';

@Component({
  selector: 'app-sync-api',
  template: '<app-sync-api-demo></app-sync-api-demo>',
  styleUrls: ['./sync-api.page.scss']
})
export class SyncApiPage {
  constructor() {}
}
