import { Routes } from '@angular/router';
import { ReciboComponent } from './recibo/recibo';
import { ReportesComponent } from './reportes/reportes';
import { InicioComponent } from './inicio/inicio';
import { UsuariosComponent } from './usuarios/usuarios';
import { BusquedaRecibosComponent } from './busqueda-recibos/busqueda-recibos';
import { authGuard } from './auth.guard';
import { reportesGuard } from './reportes.guard';
import { superadminGuard } from './superadmin.guard';
import { busquedaGuard } from './busqueda.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'recibo', component: ReciboComponent, canActivate: [authGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [reportesGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [superadminGuard] },
  { path: 'busqueda-recibos', component: BusquedaRecibosComponent, canActivate: [busquedaGuard] },
  { path: '**', redirectTo: 'inicio' }
];
