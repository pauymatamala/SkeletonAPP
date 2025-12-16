import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SyncApiPage } from './sync-api.page';

const routes: Routes = [
  {
    path: '',
    component: SyncApiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SyncApiPageRoutingModule { }
