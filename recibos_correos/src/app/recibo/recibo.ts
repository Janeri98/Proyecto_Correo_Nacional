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
    tipoServicio: '',
    tipoPago: '',  // NUEVO: Tipo de pago
  };

  reciboGenerado: any = null;
  numeroRecibo = Math.floor(Math.random() * 1000000);
  errores: { [key: string]: string } = {};

  servicios = [
    '45211 - Apartado Postal',
    '44105 - Sellos Postales',
    '45105 - Sellos Filatelicos',
    '21102 - Depósito Cta.Corriente(Filatelistas)',
    '45212 - EMS Contado',
    '12200 - Cuentas X Cobrar(EMS)',
    '45214 - Canon Postal',
    '45214 - Licencia De Operación ',
    '25100 - Fianza (Depósitos)',
    '45215 - Franqueo Contado',
    '12100 - Cuenta X Cobrar (Franqueo)',
    '45216 - Maquina Franqueadora',
    '45106 - Ventas Varias ',
    '12300 - Cuentas X Cobrar Varias',
    '45299 - Entrega de paquetes postal',
    '45299 - Entrega de pequeño paquete postal ',
    '44113 - Certificado Nacional',
    '44114 - Certificado Internacional ',
    '44112 - Servicio Express',
    '44115 - Acuse de Recibo',
    '49999 - Sacas Vacías',
    '45299 - Superficie',
    '49999 - Productos Financieros',
    '62255 - Gastos Financieros',
    '44116 - Sobres 1er dia',
    '49999 - Alquiler',
    'Otros ingresos por:',
  ];

  // NUEVO: Tipos de pago
  tiposPago = ['Efectivo', 'Tarjeta', 'Transferencia'];

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
    // NUEVA VALIDACIÓN: Tipo de pago
    if (!this.recibo.tipoPago || this.recibo.tipoPago.trim() === '') {
      this.errores['tipoPago'] = 'Seleccione un tipo de pago';
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
*Tipo de Pago:* ${this.reciboGenerado.tipoPago || 'No especificado'}
*Concepto:* ${this.reciboGenerado.concepto || 'No especificado'}
*Peso:* ${this.reciboGenerado.peso || '0'} g
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
      tipoServicio: '',
      tipoPago: '',  // NUEVO
    };
    this.reciboGenerado = null;
    this.numeroRecibo = Math.floor(Math.random() * 1000000);
    this.errores = {};
  }
}