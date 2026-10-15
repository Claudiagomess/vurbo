import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth.guard';
import { AccountPage } from './pages/account.page';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { MyApplicationsPage } from './pages/my-applications.page';
import { RepairDetailPage } from './pages/repair-detail.page';
import { RepairFormPage } from './pages/repair-form.page';
import { RepairsPage } from './pages/repairs.page';
import { ShellPage } from './pages/shell.page';
import { TechnicianRepairsPage } from './pages/technician-repairs.page';
import { TechniciansPage } from './pages/technicians.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  {
    path: '',
    component: ShellPage,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', component: HomePage },
      { path: 'reparacoes', component: RepairsPage, canActivate: [roleGuard], data: { role: 'EMPRESA' } },
      { path: 'reparacoes/nova', component: RepairFormPage, canActivate: [roleGuard], data: { role: 'EMPRESA' } },
      { path: 'reparacoes/:id', component: RepairDetailPage, canActivate: [roleGuard], data: { role: 'EMPRESA' } },
      { path: 'tecnicos', component: TechniciansPage, canActivate: [roleGuard], data: { role: 'EMPRESA' } },
      { path: 'trabalho', component: TechnicianRepairsPage, canActivate: [roleGuard], data: { role: 'TECNICO' } },
      { path: 'candidaturas', component: MyApplicationsPage, canActivate: [roleGuard], data: { role: 'TECNICO' } },
      { path: 'conta', component: AccountPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
