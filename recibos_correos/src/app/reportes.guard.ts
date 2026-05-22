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

  // Bloquear acceso a Ventanilla
  if (usuario.rol === 'Ventanilla') {
    return router.createUrlTree(['/inicio'], {
      queryParams: {
        mensaje: 'Los usuarios de Ventanilla no tienen acceso a la sección de reportes. Solo Administrador y Supervisor pueden ver reportes.'
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
