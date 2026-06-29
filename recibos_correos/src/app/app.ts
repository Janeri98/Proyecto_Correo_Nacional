import { Component, ViewChild, ElementRef, TemplateRef, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  usuarioAutenticado: boolean = false;
  usuarioActual: string = '';
  usuarioRol: string = '';
  usuarioDepartamento: string = '';
  usuarioMunicipio: string = '';
  usuarioFechaCreacion: string = '';
  usuarioCorreo: string = '';
  mostrarModalLogin: boolean = false;
  mostrarModalConfirmacion: boolean = false;
  modoRegistro: boolean = false;
  
  // Campos del formulario de registro
  formularioRegistro = {
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

  // Campos del formulario de login simplificado
  formularioLogin = {
    correo: '',
    contrasena: ''
  };
  
  erroresLogin: { [key: string]: string } = {};
  
  roles = ['Superadministrador', 'Administrador', 'Supervisor', 'Ventanilla'];
  departamentos = [
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
    'Atlántida': ['La Ceiba', 'Jutiapa', 'La Masica', 'Mahoma', 'Tela', 'Triunfo de la Cruz'],
    'Colón': ['Trujillo', 'Balfate', 'Castilla', 'Iriona', 'Limón', 'Sabá', 'Santa Fe', 'Sonaguera'],
    'Comayagua': ['Comayagua', 'Ajuterique', 'Esquías', 'Humuya', 'La Libertad', 'Lamaní', 'Las Lajas', 'Lejamaní', 'Meámbar', 'Minas de Oro', 'Ojo de Agua', 'San Jerónimo', 'San José de Comayagua', 'Siguatepeque', 'Taulabé', 'Villa de San Antonio'],
    'Copán': ['Santa Rosa de Copán', 'Cabañas', 'Concepción', 'Corquín', 'Cucuyagua', 'Dolores', 'Dulce Nombre', 'El Paraíso', 'Florida', 'La Jigua', 'Nueva Arcadia', 'San Agustín', 'San Antonio', 'San Jerónimo', 'San José', 'San Juan de Opoa', 'San Nicolás', 'San Pedro', 'Santa Rita', 'Trinidad'],
    'Cortés': ['San Pedro Sula', 'Choloma', 'La Lima', 'Omoa', 'Puerto Cortés', 'Pimienta', 'Villanueva', 'Saba', 'San Antonio de Cortés', 'San Francisco de Yojoa', 'Santa Cruz de Yojoa', 'San Manuel', 'El Progreso'],
    'Choluteca': ['Choluteca', 'Apacilagua', 'Concepción de María', 'Damián', 'El Corpus', 'Marcovia', 'Morolica', 'Namasigüe', 'Pespire', 'San Antonio de Flores', 'San Isidro', 'San José', 'San Marcos de Colón', 'San Pedro', 'Santa Ana de Yusguare', 'Santa Cruz de Yojoa'],
    'El Paraíso': ['Yuscarán', 'Danlí', 'El Paraíso', 'Gualaco', 'Jacaleapa', 'Liure', 'Morocelí', 'Oropolí', 'San Antonio de Flores', 'San Lucas', 'San Matías', 'Sana', 'Soledad', 'Teupasenti', 'Trojes'],
    'Francisco Morazán': ['Tegucigalpa', 'Cedros', 'El Porvenir', 'Guaimaca', 'La Libertad', 'Lepaterique', 'Maraita', 'Ojo de Agua', 'Reitoca', 'Sabanagrande', 'San Antonio de Oriente', 'San Buenaventura', 'San Ignacio', 'San Juan de Flores', 'Santa Ana', 'Talanga', 'Tatumbla', 'Valle de Ángeles', 'Villa de San Francisco'],
    'Gracias a Dios': ['Puerto Lempira', 'Brus Laguna', 'Juan Francisco Bulnes', 'Ahuas', 'Palacios'],
    'Intibucá': ['La Esperanza', 'Camasca', 'Colomoncagua', 'Concepción', 'Dolores', 'Intibucá', 'Jesús de Otoro', 'Magdalena', 'Masaguara', 'San Antonio', 'San Francisco', 'San Isidro', 'San Juan', 'San Marcos de la Sierra', 'Santa Lucía', 'Yamaranguila'],
    'Islas de la Bahía': ['Roatán', 'Útila', 'Guanaja'],
    'La Paz': ['La Paz', 'Cabañas', 'Cane', 'Chinacla', 'Guajiquiro', 'Lauterique', 'Marcala', 'Mercedes de Oriente', 'San Antonio del Norte', 'San José', 'San Juan', 'Santa Ana', 'Santa Elena', 'Santa María', 'Santiago de Puringla', 'Yarula'],
    'Lempira': ['Gracias', 'Belén', 'Cololaca', 'Concepción', 'Erandique', 'Gualcince', 'Guanajiquilí', 'La Campa', 'La Iguala', 'La Unión', 'Las Flores', 'La Venta', 'La Virtud', 'Lepaera', 'Mapulaca', 'Nuevo Ocotepeque', 'San Andrés', 'San Francisco', 'San Juan Guarita', 'San Manuel Colohete', 'San Rafael', 'San Sebastián', 'Santa Elena', 'Santa Rosa de Copán', 'Talgua', 'Virginia'],
    'Ocotepeque': ['Nueva Ocotepeque', 'Belén Gualcho', 'Concepción', 'Dolores', 'Fraternidad', 'La Encarnación', 'San Fernando', 'San Francisco del Valle', 'San Jorge', 'San Marcos', 'Santa Fe', 'Sinuapa'],
    'Olancho': ['Juticalpa', 'Catacamas', 'Campamento', 'Dulce Nombre de Culmí', 'El Paraíso', 'Esquipulas del Norte', 'Gualaco', 'Guata', 'Jano', 'La Unión', 'Manto', 'Patuca', 'Salamá', 'San Esteban', 'San Francisco de Becerra', 'San Isidro', 'Silca', 'Yocón'],
    'Santa Bárbara': ['Santa Bárbara', 'Alfaro', 'Chinda', 'Concepción del Norte', 'Concepción del Sur', 'El Níspero', 'Gualala', 'Ilama', 'Macuelizo', 'Naranjito', 'Nueva Celilaca', 'Nueva Frontera', 'Nueva Ocotepeque', 'Petoa', 'Quimistán', 'San Francisco de Ojuera', 'San José de Colinas', 'San Luis', 'San Nicolás', 'Santa Rita', 'Trinidad'],
    'Valle': ['Nacaome', 'Amapala', 'Aramecina', 'Caridad', 'Goascorán', 'Langue', 'San Francisco de Coray', 'San Lorenzo', 'Tengö'],
    'Yoro': ['Yoro', 'El Progreso', 'Olanchito', 'Chamelecón', 'El Negrito', 'El Negrito', 'Jutiapa', 'Mocoa', 'Morazán', 'Olanchito', 'Pimienta', 'Sulaco', 'Victoria']
  };
  municipiosDisponibles: string[] = [];
  
  apiUrl = 'http://localhost:3000/api/auth';

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  manejarClickNav(ruta: string, evento: Event) {
    if (!this.usuarioAutenticado) {
      evento.preventDefault();
      evento.stopPropagation();
      this.mostrarAlertaAccesoRequerido();
      return;
    }

    // Si el usuario ya está autenticado, permitir navegación normal.k
  }

  mostrarAlertaAccesoRequerido() {
    alert('Para acceder a esta sección necesitas iniciar sesión primero.\n\nHaz clic en "Iniciar Sesión" para comenzar.');
  }

  abrirLogin() {
    this.mostrarModalLogin = true;
    this.modoRegistro = false;
    this.formularioLogin = {
      correo: '',
      contrasena: ''
    };
    this.erroresLogin = {};
  }

  abrirRegistro() {
    this.mostrarModalLogin = true;
    this.modoRegistro = true;
    this.formularioRegistro = {
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
    this.erroresLogin = {};
  }

  actualizarMunicipios() {
    if (this.formularioRegistro.departamento) {
      this.municipiosDisponibles = this.municipiosPorDepartamento[this.formularioRegistro.departamento] || [];
    } else {
      this.municipiosDisponibles = [];
    }
    this.formularioRegistro.municipio = '';
  }

  validarRegistro(): boolean {
    this.erroresLogin = {};

    if (!this.formularioRegistro.nombre.trim()) {
      this.erroresLogin['nombre'] = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formularioRegistro.correo.trim()) {
      this.erroresLogin['correo'] = 'El correo es requerido';
    } else if (!emailRegex.test(this.formularioRegistro.correo.trim())) {
      this.erroresLogin['correo'] = 'Correo inválido';
    }

    if (!this.formularioRegistro.direccion.trim()) {
      this.erroresLogin['direccion'] = 'La dirección es requerida';
    }

    const telefonoRegex = /^[0-9+\-\s()]+$/;
    if (!this.formularioRegistro.telefono.trim()) {
      this.erroresLogin['telefono'] = 'El teléfono es requerido';
    } else if (this.formularioRegistro.telefono.trim().length < 7) {
      this.erroresLogin['telefono'] = 'El teléfono debe tener al menos 7 dígitos';
    } else if (!telefonoRegex.test(this.formularioRegistro.telefono.trim())) {
      this.erroresLogin['telefono'] = 'Teléfono inválido';
    }

    if (!this.formularioRegistro.rol.trim()) {
      this.erroresLogin['rol'] = 'El rol es requerido';
    }

    if (!this.formularioRegistro.departamento.trim()) {
      this.erroresLogin['departamento'] = 'El departamento es requerido';
    }

    if (!this.formularioRegistro.municipio.trim()) {
      this.erroresLogin['municipio'] = 'El municipio es requerido';
    }

    if (!this.formularioRegistro.contrasena.trim()) {
      this.erroresLogin['contrasena'] = 'La contraseña es requerida';
    } else if (this.formularioRegistro.contrasena.length < 6) {
      this.erroresLogin['contrasena'] = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (this.formularioRegistro.contrasena !== this.formularioRegistro.confirmarContrasena) {
      this.erroresLogin['confirmarContrasena'] = 'Las contraseñas no coinciden';
    }

    return Object.keys(this.erroresLogin).length === 0;
  }

  validarLogin(): boolean {
    this.erroresLogin = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formularioLogin.correo.trim()) {
      this.erroresLogin['correo'] = 'El correo es requerido';
    } else if (!emailRegex.test(this.formularioLogin.correo.trim())) {
      this.erroresLogin['correo'] = 'Correo inválido';
    }

    if (!this.formularioLogin.contrasena.trim()) {
      this.erroresLogin['contrasena'] = 'La contraseña es requerida';
    }

    return Object.keys(this.erroresLogin).length === 0;
  }

  registrarse() {
    if (this.validarRegistro()) {
      this.http.post(`${this.apiUrl}/registro`, {
        nombre: this.formularioRegistro.nombre.trim(),
        correo: this.formularioRegistro.correo.trim(),
        direccion: this.formularioRegistro.direccion.trim(),
        telefono: this.formularioRegistro.telefono.trim(),
        rol: this.formularioRegistro.rol,
        departamento: this.formularioRegistro.departamento,
        municipio: this.formularioRegistro.municipio,
        contrasena: this.formularioRegistro.contrasena
      }).subscribe({
        next: (response: any) => {
          alert('✓ Registro exitoso!\n\nAhora puedes iniciar sesión con tus credenciales.');
          this.modoRegistro = false;
          this.formularioLogin = {
            correo: this.formularioRegistro.correo,
            contrasena: ''
          };
        },
        error: (error) => {
          this.erroresLogin['general'] = error.error?.error || 'Error en el registro. Por favor intenta nuevamente.';
          alert(this.erroresLogin['general']);
        }
      });
    } else {
      const erroresTexto = Object.values(this.erroresLogin).join('\n');
      alert('Por favor corrige los siguientes errores:\n\n' + erroresTexto);
    }
  }

  iniciarSesion() {
    if (this.validarLogin()) {
      this.http.post(`${this.apiUrl}/login`, {
        correo: this.formularioLogin.correo.trim(),
        contrasena: this.formularioLogin.contrasena
      }).subscribe({
        next: (response: any) => {
          const usuario = response.usuario;
          
          this.usuarioActual = usuario.nombre;
          this.usuarioRol = usuario.rol;
          this.usuarioDepartamento = usuario.departamento;
          this.usuarioMunicipio = usuario.municipio;
          this.usuarioCorreo = usuario.correo;
          this.usuarioFechaCreacion = usuario.createdAt.split('T')[0];
          this.usuarioAutenticado = true;
          this.mostrarModalLogin = false;

          // Guardar en localStorage
          localStorage.setItem('usuarioAutenticado', 'true');
          localStorage.setItem('usuarioActual', this.usuarioActual);
          localStorage.setItem('usuarioRol', this.usuarioRol);
          localStorage.setItem('usuarioDepartamento', this.usuarioDepartamento);
          localStorage.setItem('usuarioMunicipio', this.usuarioMunicipio);
          localStorage.setItem('usuarioCorreo', this.usuarioCorreo);
          localStorage.setItem('usuarioFechaCreacion', this.usuarioFechaCreacion);

          this.router.navigate(['/inicio']);
        },
        error: (error) => {
          this.erroresLogin['general'] = error.error?.error || 'Error en el login. Intenta nuevamente.';
          alert(this.erroresLogin['general']);
        }
      });
    } else {
      const erroresTexto = Object.values(this.erroresLogin).join('\n');
      alert('Por favor corrige los siguientes errores:\n\n' + erroresTexto);
    }
  }

  cerrarSesion() {
    this.mostrarModalConfirmacion = true;
  }

  confirmarCerrarSesion() {
    // Limpiar localStorage primero
    localStorage.removeItem('usuarioAutenticado');
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('usuarioRol');
    localStorage.removeItem('usuarioDepartamento');
    localStorage.removeItem('usuarioMunicipio');
    localStorage.removeItem('usuarioFechaCreacion');
    localStorage.removeItem('usuarioEmail');
    localStorage.removeItem('usuarioDireccion');
    localStorage.removeItem('usuarioTelefono');
    
    // Actualizar estado del componente
    this.usuarioAutenticado = false;
    this.usuarioActual = '';
    this.usuarioRol = '';
    this.usuarioDepartamento = '';
    this.usuarioMunicipio = '';
    this.usuarioFechaCreacion = '';
    this.mostrarModalConfirmacion = false;
    this.formularioLogin = {
      correo: '',
      contrasena: ''
    };
    
    // Mostrar alerta de confirmación
    alert('✓ Sesión cerrada correctamente.\n\nBienvenido nuevamente cuando desees ingresar.');
    
    // Redirigir a inicio
    this.router.navigate(['/inicio']);
    
    // Forzar detección de cambios
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }

  cancelarCerrarSesion() {
    this.mostrarModalConfirmacion = false;
  }

  // Método para verificar si el usuario actual puede ver reportes
  puedeVerReportes(): boolean {
    const usuario = this.authService.getUsuarioActual();
    if (!usuario) return false;
    return this.authService.puedeVerReportes(usuario);
  }

  ngOnInit() {
    // Verificar si hay sesión guardada al cargar
    const sesionGuardada = localStorage.getItem('usuarioAutenticado');
    if (sesionGuardada === 'true') {
      this.usuarioActual = localStorage.getItem('usuarioActual') || '';
      this.usuarioRol = localStorage.getItem('usuarioRol') || '';
      this.usuarioDepartamento = localStorage.getItem('usuarioDepartamento') || '';
      this.usuarioMunicipio = localStorage.getItem('usuarioMunicipio') || '';
      this.usuarioFechaCreacion = localStorage.getItem('usuarioFechaCreacion') || '';
      this.usuarioAutenticado = true;
    }
  }
}