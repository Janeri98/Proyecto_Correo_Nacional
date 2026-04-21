import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recibo.html',
  styleUrls: ['./recibo.css'],
})
export class ReciboComponent {
  recibo = {
    numero: '',
    oficina: '',
    fecha: '',
    remitente: '',
    destinatario: '',
    concepto: '',
    peso: null,
    costo: null,
    tipoServicio: 'Correo Normal',
  };

  reciboGenerado: any = null;
  numeroRecibo = Math.floor(Math.random() * 1000000);
  errores: { [key: string]: string } = {};

  servicios = [
    'Apartado Postal',
    'Sellos Postales',
    'Sellos Filatelicos',
    'Depósito Cta.Corriente(Filatelistas)', 
    'EMS Contado',
    'Cuentas X Cobrar(EMS)',
    'Canon Postal',
    'Licencia De Opoeración ',
    'Fianza (Depósitos)',
    'Franqueo Contado',
    'Cuenta X Cobrar (Franqueo)',
    'Maquina Franqueadora',
    'Ventas Varias ',
    'Cuentas X Cobrar Varias',
    'Entrega de paquetes postal',
    'Entrega de pequeño paquete postal ',
    'Certificado Nacional',
    'Certificado Internacional ',
    'Servicio Express',
    'Acuse de Recibo',
    'Sacas Vacías',
    'Superficie',
    'Productos Financieros',
    'Gastos Financieros',
    'Sobres 1er dia',
    'Alquiler',
    'Otros ingresos por:',
  ];

  validarCampos(): boolean {
    this.errores = {};

    if (!this.recibo.oficina || this.recibo.oficina.trim() === '') {
      this.errores['oficina'] = 'La oficina es requerida';
    }
    if (!this.recibo.fecha || this.recibo.fecha.trim() === '') {
      this.errores['fecha'] = 'La fecha es requerida';
    }
    if (!this.recibo.remitente || this.recibo.remitente.trim() === '') {
      this.errores['remitente'] = 'El remitente es requerido';
    }
    if (!this.recibo.destinatario || this.recibo.destinatario.trim() === '') {
      this.errores['destinatario'] = 'El destinatario es requerido';
    }
    if (!this.recibo.tipoServicio || this.recibo.tipoServicio.trim() === '') {
      this.errores['tipoServicio'] = 'Seleccione un tipo de servicio';
    }
    if (!this.recibo.costo || this.recibo.costo <= 0) {
      this.errores['costo'] = 'El costo debe ser mayor a 0';
    }

    return Object.keys(this.errores).length === 0;
  }

  generarRecibo() {
    if (!this.validarCampos()) {
      return;
    }
    
    this.reciboGenerado = {
      ...this.recibo,
      numero: this.numeroRecibo,
      fechaPago: this.recibo.fecha || new Date().toISOString().split('T')[0],
      total: this.recibo.costo || 0,
    };
  }

  imprimir() {
    window.print();
  }

  nuevoRecibo() {
    this.recibo = {
      numero: '',
      oficina: '',
      fecha: '',
      remitente: '',
      destinatario: '',
      concepto: '',
      peso: null,
      costo: null,
      tipoServicio: 'Correo Normal',
    };
    this.reciboGenerado = null;
    this.numeroRecibo = Math.floor(Math.random() * 1000000);
    this.errores = {};
  }
}
