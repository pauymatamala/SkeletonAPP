import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { SelectivePreloadingService } from './core/selective-preloading.service';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    data: { preload: true },
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'registrar',
    loadChildren: () => import('./registrar/registrar.module').then( m => m.RegistrarPageModule)
  },
  {
    path: 'portada',
    loadChildren: () => import('./portada/portada.module').then( m => m.PortadaPageModule)
  },
  {
    path: 'categorias',
    data: { preload: true },
    loadChildren: () => import('./categorias/categorias.module').then( m => m.CategoriasPageModule)
  },
  {
    path: 'news',
    canActivate: [AuthGuard],
    loadChildren: () => import('./news/news.module').then(m => m.NewsPageModule)
  }
  ,
    {
      path: 'sync-api',
      canActivate: [AuthGuard],
      loadChildren: () => import('./sync-api/sync-api.module').then(m => m.SyncApiPageModule)
    },
  {
    path: '**',
    loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: SelectivePreloadingService })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
