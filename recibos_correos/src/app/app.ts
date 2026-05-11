import { Component, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  usuarioAutenticado: boolean = false;
  usuarioActual: string = '';
  usuarioRol: string = '';
  usuarioDepartamento: string = '';
  usuarioMunicipio: string = '';
  usuarioFechaCreacion: string = '';
  mostrarModalLogin: boolean = false;
  mostrarModalConfirmacion: boolean = false;
  
  // Campos del formulario de login / creación de usuario
  formularioLogin = {
    nombre: '',
    correo: '',
    direccion: '',
    telefono: '',
    rol: '',
    departamento: '',
    municipio: ''
  };
  
  erroresLogin: { [key: string]: string } = {};
  
  roles = ['Admin (Master)', 'Usuario'];
  departamentos = ['Francisco Morazán', 'Atlántida', 'Cortés', 'Choluteca', 'Olancho', 'Santa Bárbara', 'Colón', 'Copán'];
  municipios = ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choluteca', 'Juticalpa', 'Santa Rosa de Copán', 'Trujillo', 'Gracias'];
  
  constructor(private router: Router) {}
  
  abrirLogin() {
    this.mostrarModalLogin = true;
    this.formularioLogin = {
      nombre: '',
      correo: '',
      direccion: '',
      telefono: '',
      rol: '',
      departamento: '',
      municipio: ''
    };
    this.erroresLogin = {};
  }

  validarFormularioLogin(): boolean {
    this.erroresLogin = {};
    
    // Validar nombre
    if (!this.formularioLogin.nombre.trim()) {
      this.erroresLogin['nombre'] = 'El nombre es requerido';
    }
    
    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formularioLogin.correo.trim()) {
      this.erroresLogin['correo'] = 'El correo es requerido';
    } else if (!emailRegex.test(this.formularioLogin.correo.trim())) {
      this.erroresLogin['correo'] = 'Correo inválido (ej: usuario@ejemplo.com)';
    }
    
    // Validar dirección
    if (!this.formularioLogin.direccion.trim()) {
      this.erroresLogin['direccion'] = 'La dirección es requerida';
    }
    
    // Validar teléfono
    const telefonoRegex = /^[0-9+\-\s()]+$/;
    if (!this.formularioLogin.telefono.trim()) {
      this.erroresLogin['telefono'] = 'El teléfono es requerido';
    } else if (this.formularioLogin.telefono.trim().length < 7) {
      this.erroresLogin['telefono'] = 'El teléfono debe tener al menos 7 dígitos';
    } else if (!telefonoRegex.test(this.formularioLogin.telefono.trim())) {
      this.erroresLogin['telefono'] = 'Teléfono inválido';
    }

    // Validar rol y ubicación
    if (!this.formularioLogin.rol.trim()) {
      this.erroresLogin['rol'] = 'El rol es requerido';
    }
    if (!this.formularioLogin.departamento.trim()) {
      this.erroresLogin['departamento'] = 'El departamento es requerido';
    }
    if (!this.formularioLogin.municipio.trim()) {
      this.erroresLogin['municipio'] = 'El municipio es requerido';
    }
    
    return Object.keys(this.erroresLogin).length === 0;
  }

  iniciarSesion() {
    if (this.validarFormularioLogin()) {
      this.usuarioActual = this.formularioLogin.nombre.trim();
      this.usuarioRol = this.formularioLogin.rol;
      this.usuarioDepartamento = this.formularioLogin.departamento;
      this.usuarioMunicipio = this.formularioLogin.municipio;
      this.usuarioAutenticado = true;
      this.mostrarModalLogin = false;
      
      // Verificar si ya existe fecha de creación, si no, crearla
      const fechaExistente = localStorage.getItem('usuarioFechaCreacion');
      if (!fechaExistente) {
        this.usuarioFechaCreacion = new Date().toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
        localStorage.setItem('usuarioFechaCreacion', this.usuarioFechaCreacion);
      } else {
        this.usuarioFechaCreacion = fechaExistente;
      }
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('usuarioAutenticado', 'true');
      localStorage.setItem('usuarioActual', this.usuarioActual);
      localStorage.setItem('usuarioRol', this.usuarioRol);
      localStorage.setItem('usuarioDepartamento', this.usuarioDepartamento);
      localStorage.setItem('usuarioMunicipio', this.usuarioMunicipio);
      localStorage.setItem('usuarioEmail', this.formularioLogin.correo);
      localStorage.setItem('usuarioDireccion', this.formularioLogin.direccion);
      localStorage.setItem('usuarioTelefono', this.formularioLogin.telefono);
      
      // Redirigir a la página de inicio
      this.router.navigate(['/inicio']);
    } else {
      // Mostrar alerta con errores
      const erroresTexto = Object.values(this.erroresLogin).join('\n');
      alert('Por favor corrige los siguientes errores:\n\n' + erroresTexto);
    }
  }

  cerrarSesion() {
    this.mostrarModalConfirmacion = true;
  }

  confirmarCerrarSesion() {
    this.usuarioAutenticado = false;
    this.usuarioActual = '';
    this.usuarioRol = '';
    this.usuarioDepartamento = '';
    this.usuarioMunicipio = '';
    this.usuarioFechaCreacion = '';
    this.mostrarModalConfirmacion = false;
    this.formularioLogin = {
      nombre: '',
      correo: '',
      direccion: '',
      telefono: '',
      rol: '',
      departamento: '',
      municipio: ''
    };
    
    // Limpiar localStorage
    localStorage.removeItem('usuarioAutenticado');
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('usuarioRol');
    localStorage.removeItem('usuarioDepartamento');
    localStorage.removeItem('usuarioMunicipio');
    localStorage.removeItem('usuarioFechaCreacion');
    localStorage.removeItem('usuarioEmail');
    localStorage.removeItem('usuarioDireccion');
    localStorage.removeItem('usuarioTelefono');
    
    // Redirigir a inicio
    this.router.navigate(['/inicio']);
  }

  cancelarCerrarSesion() {
    this.mostrarModalConfirmacion = false;
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