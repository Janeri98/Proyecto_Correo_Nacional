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
  recibosGenerados?: number;
  suspendido?: boolean;
}

interface NuevoUsuario {
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  rol: string;
  departamento: string;
  municipio: string;
  contrasena: string;
  confirmarContrasena: string;
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
  apiUrl = '/api/auth';

  // Crear usuario
  nuevoUsuario: NuevoUsuario = {
    nombre: '',
    correo: '',
    direccion: '',
    telefono: '',
    rol: '',
    departamento: '',
    municipio: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  departamentos: string[] = [
    'Atlántida',
    'Colón',
    'Comayagua',
    'Copán',
    'Cortés',
    'Choluteca',
    'El Paraíso',
    'Francisco Morazán',
    'Gracias a Dios',
    'Intibucá',
    'Islas de la Bahía',
    'La Paz',
    'Lempira',
    'Ocotepeque',
    'Olancho',
    'Santa Bárbara',
    'Valle',
    'Yoro'
  ];

  municipiosPorDepartamento: { [key: string]: string[] } = {
    'Atlántida': ['La Ceiba', 'Jutiapa', 'La Masica', 'Mahogany', 'Tela', 'Triunfo de la Cruz'],
    'Colón': ['Trujillo', 'Balfate', 'Castilla', 'Garifuna', 'La Unión', 'Limón', 'Nombre de Dios', 'Saba', 'Santa Fe'],
    'Comayagua': ['Comayagua', 'Ajuterique', 'Esquías', 'Humuya', 'La Libertad', 'Lamaní', 'Meambar', 'Micina', 'Ojo de Agua', 'San Jerónimo', 'San José de Comayagua', 'Villantigua'],
    'Copán': ['Santa Rosa de Copán', 'Cabañas', 'Concepción', 'Corquín', 'Cucala', 'Dolores', 'Dulce Nombre', 'El Paraíso', 'Filadélfia', 'La Jigua', 'La Prensa', 'Nueva Arcadia', 'Nueva Ópita', 'San Agustín', 'San Antonio', 'San Jerónimo', 'San Jorge', 'San Juan de Opoa', 'San Julián', 'San Rafael'],
    'Cortés': ['San Pedro Sula', 'Choloma', 'Cortés', 'La Lima', 'Omoa', 'Puerto Cortés', 'Pimienta', 'Villanueva', 'Buenos Aires'],
    'Choluteca': ['Choluteca', 'Apacilagua', 'Concepción de María', 'Damián', 'El Corpus', 'Guachapale', 'Morolica', 'Namasigue', 'Pespire', 'San Isidro', 'San José', 'San Marcos'],
    'El Paraíso': ['Yuscarán', 'Anapala', 'Danli', 'El Paraíso', 'Güinope', 'Jacaleapa', 'Jamastran', 'Liure', 'Morocelí', 'Ooteca', 'San Lucas', 'San Matías', 'Soledad', 'Teupasenti', 'Vado Ancho'],
    'Francisco Morazán': ['Tegucigalpa', 'Cedros', 'Cuidad de Honduras', 'Tatumbla', 'Villa de San Francisco', 'El Porvenir', 'Guachapale', 'La Venta', 'Lepaterique', 'Ojo de Agua', 'Reitoca', 'San Antonio de Oriente', 'San Buenaventura', 'San Ignacio', 'San Juan de Flores', 'Santa Ana', 'Talanga'],
    'Gracias a Dios': ['Lhuas Playa', 'Brus Laguna', 'Wampusirpi', 'Puerto Lempira'],
    'Intibucá': ['La Esperanza', 'Camasca', 'Colomoncagua', 'Intibucá', 'Magdalena', 'Masaguara', 'Opatoro', 'San Antonio', 'San Isidro', 'San Juan', 'San Marcos', 'Santa Lucia', 'Siguatepeque'],
    'Islas de la Bahía': ['French Harbour', 'Oak Ridge', 'Utila', 'Guanaja', 'Sandy Bay'],
    'La Paz': ['La Paz', 'Ahuachapán', 'Cangrejera', 'El Rosario', 'Guajiquiro', 'La Labranza', 'Marcala', 'Mercedes Cortés', 'Opatoro', 'San Antonio del Norte', 'San Javier', 'Santa María', 'Santiago de Puringla'],
    'Lempira': ['Gracias', 'Belén Gualcho', 'Cármen', 'Erandique', 'Gualcinse', 'Guanacaure', 'La Campa', 'La Encarnación', 'La Unión', 'Lejanías', 'Mapulaca', 'Paraquay', 'San Andrés', 'San Manuel Colinas', 'San Rafael', 'Santa Rosa del Abra', 'Talgua', 'Tambla', 'Testosterona', 'Tomala'],
    'Ocotepeque': ['Ocotepeque', 'Belén Gualcho', 'Fraternidad', 'La Encarnación', 'La Unión', 'Mercedes Cortés', 'Sensenti', 'Sinuapa'],
    'Olancho': ['Juticalpa', 'Campamento', 'Catacamas', 'Dulce Nombre de Culmí', 'Esquipulas del Norte', 'Gualaco', 'Guata', 'Limón', 'San Esteban', 'Silca'],
    'Santa Bárbara': ['Santa Bárbara', 'Ahua', 'Azacualpa', 'Ceguaca', 'Chinda', 'Concepción del Sur', 'Gladys', 'Gualala', 'Macuelizo', 'Naranjito', 'Nueva Celilac', 'Petoa', 'Quimistán', 'San Luis', 'San Nicolás', 'Santa Rosa'],
    'Valle': ['Nacaome', 'Amapala', 'Aramecina', 'Goascorán', 'Langue', 'San Francisco de Coray'],
    'Yoro': ['Yoro', 'Arenal', 'Choloma', 'Concordia', 'El Negrito', 'El Progreso', 'Olanchito', 'Pimienta', 'Sulaco', 'Victoria']
  };

  municipiosDisponibles: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    console.log('[Usuarios] Iniciando carga de usuarios...');
    this.cargando = true;
    this.error = '';

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
        this.usuarios = (usuarios || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  suspenderUsuario(usuario: UsuarioListado): void {
    const confirmacion = confirm(`¿Estás seguro de suspender a ${usuario.nombre}? No podrá acceder a la plataforma.`);
    if (!confirmacion) {
      return;
    }

    this.http.patch(`${this.apiUrl}/usuarios/${usuario.id}/suspender`, { suspendido: true }).subscribe({
      next: () => {
        usuario.suspendido = true;
        alert(`Usuario ${usuario.nombre} suspendido.`);
      },
      error: (error) => {
        alert(error.error?.error || 'No se pudo suspender el usuario.');
      }
    });
  }

  reactivarUsuario(usuario: UsuarioListado): void {
    const confirmacion = confirm(`¿Estás seguro de reactivar a ${usuario.nombre}?`);
    if (!confirmacion) {
      return;
    }

    this.http.patch(`${this.apiUrl}/usuarios/${usuario.id}/suspender`, { suspendido: false }).subscribe({
      next: () => {
        usuario.suspendido = false;
        alert(`Usuario ${usuario.nombre} reactivado.`);
      },
      error: (error) => {
        alert(error.error?.error || 'No se pudo reactivar el usuario.');
      }
    });
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

  // ===== MÉTODOS PARA CREAR NUEVO USUARIO =====
  limpiarFormulario(): void {
    this.nuevoUsuario = {
      nombre: '',
      correo: '',
      direccion: '',
      telefono: '',
      rol: '',
      departamento: '',
      municipio: '',
      contrasena: '',
      confirmarContrasena: ''
    };
    this.municipiosDisponibles = [];
  }

  actualizarMunicipios(): void {
    if (this.nuevoUsuario.departamento) {
      this.municipiosDisponibles = this.municipiosPorDepartamento[this.nuevoUsuario.departamento] || [];
      this.nuevoUsuario.municipio = '';
    }
  }

  crearNuevoUsuario(): void {
    // Validaciones
    if (!this.nuevoUsuario.nombre.trim()) {
      alert('El nombre completo es requerido.');
      return;
    }
    if (!this.nuevoUsuario.correo.trim()) {
      alert('El correo electrónico es requerido.');
      return;
    }
    if (!this.nuevoUsuario.direccion.trim()) {
      alert('La dirección es requerida.');
      return;
    }
    if (!this.nuevoUsuario.telefono.trim()) {
      alert('El número de teléfono es requerido.');
      return;
    }
    if (!this.nuevoUsuario.rol) {
      alert('Selecciona un rol de usuario.');
      return;
    }
    if (!this.nuevoUsuario.departamento) {
      alert('Selecciona un departamento.');
      return;
    }
    if (!this.nuevoUsuario.municipio) {
      alert('Selecciona un municipio.');
      return;
    }
    if (!this.nuevoUsuario.contrasena.trim()) {
      alert('La contraseña es requerida.');
      return;
    }
    if (this.nuevoUsuario.contrasena !== this.nuevoUsuario.confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Enviar datos al servidor
    const datosUsuario = {
      nombre: this.nuevoUsuario.nombre,
      correo: this.nuevoUsuario.correo,
      direccion: this.nuevoUsuario.direccion,
      telefono: this.nuevoUsuario.telefono,
      rol: this.nuevoUsuario.rol,
      departamento: this.nuevoUsuario.departamento,
      municipio: this.nuevoUsuario.municipio,
      contrasena: this.nuevoUsuario.contrasena
    };

    this.http.post(`${this.apiUrl}/registro`, datosUsuario).subscribe({
      next: (response: any) => {
        alert('Usuario creado exitosamente.');
        this.limpiarFormulario();
        this.cargarUsuarios();
      },
      error: (error) => {
        alert(error.error?.error || 'Error al crear el usuario.');
      }
    });
  }
}
