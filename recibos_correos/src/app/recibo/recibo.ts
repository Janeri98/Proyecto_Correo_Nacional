import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recibo.html',
  styleUrls: ['./recibo.css'],
})
export class ReciboComponent {
  @ViewChild('reciboContent', { static: false }) reciboContent!: ElementRef;
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
    'Licencia De Operación ',
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

  enviarPorWhatsApp() {
    if (!this.reciboGenerado) {
      alert('Primero debe generar un recibo');
      return;
    }

    // Construir el mensaje con los detalles del recibo
    const mensaje = `🧾 *RECIBO DE PAGO - CORREOS DE HONDURAS*

*Recibo Nº:* ${this.reciboGenerado.numero}
*Oficina:* ${this.reciboGenerado.oficina}
*Fecha:* ${this.reciboGenerado.fechaPago}
*Remitente:* ${this.reciboGenerado.remitente}
*Destinatario:* ${this.reciboGenerado.destinatario}
*Tipo de Servicio:* ${this.reciboGenerado.tipoServicio}
*Concepto:* ${this.reciboGenerado.concepto || 'No especificado'}
*Peso:* ${this.reciboGenerado.peso || '0'} kg
*TOTAL A PAGAR:* L. ${(this.reciboGenerado.total || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

¡Gracias por usar los servicios de Correos de Honduras!`;

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    // Generar el link de WhatsApp
    const linkWhatsApp = `https://wa.me/?text=${mensajeCodificado}`;

    // Abrir WhatsApp Web en una nueva pestaña
    window.open(linkWhatsApp, '_blank');
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
