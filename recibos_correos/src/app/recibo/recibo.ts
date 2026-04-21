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

  generarRecibo() {
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
  }
}
