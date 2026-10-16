import { Routes } from '@angular/router';
import { roleGuard } from './core/guards';
import { PublicLayout } from './layout/public-layout';
import { AdminPage } from './pages/admin-page';
import { ClientPage } from './pages/client-page';
import { Home } from './pages/home';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ServicePage } from './pages/service-page';
import { TechPage } from './pages/tech-page';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home },
      { path: 'vurbo', component: ServicePage, data: { key: 'vurbo' } },
      { path: 'vurbo-air', component: ServicePage, data: { key: 'air' } },
      { path: 'vurbo-rent', component: ServicePage, data: { key: 'rent' } },
      { path: 'vurbo-care', component: ServicePage, data: { key: 'care' } },
      { path: 'entrar', component: LoginPage },
      { path: 'registo', component: RegisterPage },
      { path: 'cliente', component: ClientPage, canActivate: [roleGuard('CLIENT')] },
      { path: 'tecnico', component: TechPage, canActivate: [roleGuard('TECHNICIAN')] },
      { path: 'admin', component: AdminPage, canActivate: [roleGuard('ADMIN')] },
    ],
  },
  { path: '**', redirectTo: '' },
];
