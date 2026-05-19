import { Injectable } from '@angular/core';

export interface Usuario {
  nombre: string;
  correo: string;
  rol: string;
  departamento: string;
  municipio: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Definir jerarquía de roles
  private rolesJerarquia = {
    'Administrador': 3, // Acceso total
    'Supervisor': 2,    // Acceso a reportes y recibos
    'Normal': 1         // Solo ingreso de recibos
  };

  constructor() { }

  // Método para verificar permisos generales
  tienePermiso(usuario: Usuario): boolean {
    const nivelUsuario = this.rolesJerarquia[usuario.rol as keyof typeof this.rolesJerarquia];
    return nivelUsuario >= 1;
  }

  puedeVerReportes(usuario: Usuario): boolean {
    const nivelUsuario = this.rolesJerarquia[usuario.rol as keyof typeof this.rolesJerarquia];
    return nivelUsuario >= 2;
  }

  puedeCrearRecibos(usuario: Usuario): boolean {
    const nivelUsuario = this.rolesJerarquia[usuario.rol as keyof typeof this.rolesJerarquia];
    return nivelUsuario >= 1;
  }

  esAdministrador(usuario: Usuario): boolean {
    return usuario.rol === 'Administrador';
  }

  // Obtener usuario actual desde localStorage
  getUsuarioActual(): Usuario | null {
    const autenticado = localStorage.getItem('usuarioAutenticado');
    if (autenticado === 'true') {
      return {
        nombre: localStorage.getItem('usuarioActual') || '',      
        correo: localStorage.getItem('usuarioEmail') || '',
        rol: localStorage.getItem('usuarioRol') || '', 
        departamento: localStorage.getItem('usuarioDepartamento') || '',
        municipio: localStorage.getItem('usuarioMunicipio') || ''
      };
    }
    return null;
  }
}