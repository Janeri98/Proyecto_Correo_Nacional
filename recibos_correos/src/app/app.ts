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
  mostrarModalLogin: boolean = false;
  
  // Campos del formulario de login
  formularioLogin = {
    nombre: '',
    correo: '',
    direccion: '',
    telefono: ''
  };
  
  erroresLogin: { [key: string]: string } = {};
  
  constructor(private router: Router) {}
  
  abrirLogin() {
    this.mostrarModalLogin = true;
    this.formularioLogin = { nombre: '', correo: '', direccion: '', telefono: '' };
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
    
    return Object.keys(this.erroresLogin).length === 0;
  }

  iniciarSesion() {
    if (this.validarFormularioLogin()) {
      this.usuarioActual = this.formularioLogin.nombre.trim();
      this.usuarioAutenticado = true;
      this.mostrarModalLogin = false;
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('usuarioAutenticado', 'true');
      localStorage.setItem('usuarioActual', this.usuarioActual);
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
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.usuarioAutenticado = false;
      this.usuarioActual = '';
      this.mostrarModalLogin = false;
      this.formularioLogin = { nombre: '', correo: '', direccion: '', telefono: '' };
      
      // Limpiar localStorage
      localStorage.removeItem('usuarioAutenticado');
      localStorage.removeItem('usuarioActual');
      localStorage.removeItem('usuarioEmail');
      localStorage.removeItem('usuarioDireccion');
      localStorage.removeItem('usuarioTelefono');
    }
  }

  ngOnInit() {
    // Verificar si hay sesión guardada al cargar
    const sesionGuardada = localStorage.getItem('usuarioAutenticado');
    if (sesionGuardada === 'true') {
      this.usuarioActual = localStorage.getItem('usuarioActual') || '';
      this.usuarioAutenticado = true;
    }
  }
}