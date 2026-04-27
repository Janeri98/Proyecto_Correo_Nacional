import { Routes } from '@angular/router';
import { ReciboComponent } from './recibo/recibo';
import { ReportesComponent } from './reportes/reportes';

export const routes: Routes = [
  { path: '', redirectTo: 'recibo', pathMatch: 'full' },
  { path: 'recibo', component: ReciboComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: '**', redirectTo: 'recibo' }
];
