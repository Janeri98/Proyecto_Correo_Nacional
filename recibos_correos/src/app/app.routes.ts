import { Routes } from '@angular/router';
import { ReciboComponent } from './recibo/recibo';
import { ReportesComponent } from './reportes/reportes';
import { InicioComponent } from './inicio/inicio';
import { authGuard } from './auth.guard';
import { reportesGuard } from './reportes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'recibo', component: ReciboComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [reportesGuard] },
  { path: '**', redirectTo: 'inicio' }
];
