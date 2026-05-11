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
    'Admin (Master)': 2, // Ve todo
    'Usuario': 1         // Acceso limitado
  };

  constructor() { }

  // Método para verificar permisos
  tienePermiso(usuario: Usuario): boolean {
    const nivelUsuario = this.rolesJerarquia[usuario.rol as keyof typeof this.rolesJerarquia];
    return nivelUsuario >= 2; // Solo Admin ve reportes
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