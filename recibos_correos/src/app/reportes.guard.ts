import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';

export const reportesGuard = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuarioActual();
  
  if (!usuario) {
    return router.createUrlTree(['/inicio'], {
      queryParams: {
        mensaje: 'Debes iniciar sesión primero para acceder a esta sección.'
      }
    });
  }

  // Verificar si el usuario tiene permisos para ver reportes
  if (authService.puedeVerReportes(usuario)) {
    return true;
  }

  // Si no tiene permisos, redirigir a inicio con mensaje
  return router.createUrlTree(['/inicio'], {
    queryParams: {
      mensaje: 'No tienes permisos para acceder a la sección de reportes.'
    }
  });
};
