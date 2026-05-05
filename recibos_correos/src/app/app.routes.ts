import { Routes } from '@angular/router';
import { ReciboComponent } from './recibo/recibo';
import { ReportesComponent } from './reportes/reportes';
import { InicioComponent } from './inicio/inicio';

export const routes: Routes = [
  { path: '', redirectTo: 'recibo', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'recibo', component: ReciboComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: '**', redirectTo: 'recibo' }
];
