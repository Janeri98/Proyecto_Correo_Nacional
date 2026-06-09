import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class busquedaGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const usuario = this.authService.getUsuarioActual();
    
    if (!usuario) {
      this.router.navigate(['/inicio']);
      return false;
    }

    // Todos los usuarios autenticados pueden acceder
    return true;
  }
}
