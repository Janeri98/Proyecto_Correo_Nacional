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
  
  roles = ['Administrador', 'Supervisor', 'Ventanilla'];
  departamentos = ['Francisco Morazán', 'Atlántida', 'Cortés', 'Choluteca', 'Olancho', 'Santa Bárbara', 'Colón', 'Copán'];
  municipios = ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choluteca', 'Juticalpa', 'Santa Rosa de Copán', 'Trujillo', 'Gracias'];
  
  apiUrl = 'http://localhost:3000/api/auth';

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  manejarClickNav(ruta: string, evento: Event) {
    if (!this.usuarioAutenticado) {
      evento.preventDefault();
      evento.stopPropagation();
      this.mostrarAlertaAccesoRequerido();
      return;
    }

    // Si el usuario ya está autenticado, permitir navegación normal.
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
    this.erroresLogin = {};
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

          this.router.navigate(['/recibo']);
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
      this.usuarioCorreo = localStorage.getItem('usuarioCorreo') || '';
      this.usuarioAutenticado = true;
      
      // No mostrar modal de login
      this.mostrarModalLogin = false;
      this.modoRegistro = false;
    }
  }
}