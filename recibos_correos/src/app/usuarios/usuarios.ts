import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface UsuarioListado {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  rolAnterior?: string;
  departamento: string;
  municipio: string;
  createdAt: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioListado[] = [];
  usuariosFiltrados: UsuarioListado[] = [];
  searchTerm: string = '';
  error: string = '';
  cargando: boolean = false;
  roles: string[] = ['Administrador', 'Supervisor', 'Ventanilla'];
  apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    console.log('[Usuarios] Iniciando carga de usuarios...');
    this.cargando = true;
    this.error = '';

    // Timeout fallback: si la petición queda colgada, mostrar error y ocultar el indicador
    const timeout = setTimeout(() => {
      if (this.cargando) {
        console.error('[Usuarios] La petición está tardando demasiado. Forzando fin de carga.');
        this.error = 'La petición de usuarios está tardando demasiado.';
        this.cargando = false;
      }
    }, 8000);

    this.http.get<UsuarioListado[]>(`${this.apiUrl}/usuarios`).subscribe({
      next: (usuarios) => {
        console.log('[Usuarios] Respuesta recibida, usuarios:', usuarios.length);
        clearTimeout(timeout);
        this.usuarios = usuarios || [];
        this.usuariosFiltrados = this.usuarios;
        this.cargando = false;
      },
      error: (error) => {
        console.error('[Usuarios] Error cargando usuarios:', error);
        clearTimeout(timeout);
        this.error = error.error?.error || 'Error cargando la lista de usuarios.';
        this.cargando = false;
      }
    });
  }

  puedePromover(usuario: UsuarioListado): boolean {
    return usuario.rol === 'Supervisor' || usuario.rol === 'Ventanilla';
  }

  getRolesDisponibles(usuario: UsuarioListado): string[] {
    return this.roles.filter(rol => rol !== usuario.rol);
  }

  actualizarRol(usuario: UsuarioListado): void {
    const nuevoRol = usuario.rol;
    if (!nuevoRol || nuevoRol.trim() === '') {
      alert('Selecciona un rol válido antes de guardar.');
      return;
    }

    this.http.patch(`${this.apiUrl}/usuarios/${usuario.id}/rol`, { rol: nuevoRol }).subscribe({
      next: () => {
        alert(`Rol de ${usuario.nombre} actualizado a ${nuevoRol}.`);
        this.cargarUsuarios();
      },
      error: (error) => {
        alert(error.error?.error || 'No se pudo actualizar el rol.');
      }
    });
  }

  eliminarUsuario(usuario: UsuarioListado): void {
    const confirmacion = confirm(`¿Estás seguro de eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmacion) {
      return;
    }

    this.http.delete(`${this.apiUrl}/usuarios/${usuario.id}`).subscribe({
      next: () => {
        alert(`Usuario ${usuario.nombre} eliminado.`);
        this.cargarUsuarios();
      },
      error: (error) => {
        alert(error.error?.error || 'No se pudo eliminar el usuario.');
      }
    });
  }

  promoverAAdmin(usuario: UsuarioListado): void {
    usuario.rol = 'Administrador';
    this.actualizarRol(usuario);
  }

  buscarUsuarios(): void {
    const termino = this.searchTerm.trim().toLowerCase();
    if (!termino) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      return (
        usuario.nombre.toLowerCase().includes(termino) ||
        usuario.correo.toLowerCase().includes(termino) ||
        usuario.departamento.toLowerCase().includes(termino) ||
        usuario.municipio.toLowerCase().includes(termino)
      );
    });
  }
}
