import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';

export const superadminGuard = (): boolean | UrlTree => {
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

  if (authService.esSuperAdministrador(usuario)) {
    return true;
  }

  return router.createUrlTree(['/inicio'], {
    queryParams: {
      mensaje: 'Solo Superadministrador puede acceder a la gestión de usuarios.'
    }
  });
};
