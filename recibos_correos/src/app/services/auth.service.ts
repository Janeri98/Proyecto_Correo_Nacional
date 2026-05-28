import { Injectable } from '@angular/core';

export interface Usuario {
  nombre: string;
  correo: string;
  rol: string;
  departamento: string;
  municipio: string;
  contrasena?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Definir jerarquía de roles
  private rolesJerarquia = {
    'Superadministrador': 4, // Acceso total y gestión de usuarios
    'Administrador': 3,      // Acceso total
    'Supervisor': 2,         // Acceso a reportes y recibos
    'Ventanilla': 1          // Solo ingreso de recibos
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
    return usuario.rol === 'Administrador' || usuario.rol === 'Superadministrador';
  }

  esSuperAdministrador(usuario: Usuario): boolean {
    return usuario.rol === 'Superadministrador';
  }

  requiereContrasena(rol: string): boolean {
    return rol === 'Administrador' || rol === 'Supervisor';
  }

  validarContrasena(rol: string, contrasena: string): boolean {
    // Contraseñas predefinidas para demostración
    // En producción, esto debería conectarse a una base de datos
    const contrasenasValidas: { [key: string]: string } = {
      'Administrador': 'admin123',
      'Supervisor': 'supervisor123'
    };
    return contrasenasValidas[rol] === contrasena;
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