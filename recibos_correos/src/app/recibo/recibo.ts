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
    peso: null as number | null,
    costo: null as number | null,
    tipoServicio: '',
    tipoPago: '',
    grupo: 'grupo1', // NUEVO: Grupo geográfico
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

  // NUEVO: Grupos geográficos
  grupos = [
    { id: 'grupo1', nombre: 'Centro América (GRUPO I)' },
    { id: 'grupo2', nombre: 'Norte América (GRUPO II)' },
    { id: 'grupo3', nombre: 'Sur América Y Caribe (GRUPO III)' },
    { id: 'grupo4', nombre: 'Europa (GRUPO IV)' },
    { id: 'grupo5', nombre: 'Resto del Mundo (GRUPO V)' },
  ];

  // NUEVO: Tabla de precios por rango de peso y grupo geográfico
  tablaPrecios = {
    grupo1: { 
      // Centro América
      '1-20': 320, '21-50': 320, '51-100': 320, '101-250': 320, '251-500': 370, '501-1000': 420, 
      '1001-1500': 470, '1501-2000': 520, '2001-2500': 570, '2501-3000': 620, '3001-3500': 670, 
      '3501-4000': 720, '4001-4500': 770, '4501-5000': 820, '5001-5500': 870, '5501-6000': 920, 
      '6001-6500': 970, '6501-7000': 1020, '7001-7500': 1070, '7501-8000': 1120, '8001-8500': 1170,
      '8501-9000': 1220, '9001-9500': 1270, '9501-10000': 1320
    },
    grupo2: {
      // Norte América
      '1-20': 400, '21-50': 400, '51-100': 400, '101-250': 400, '251-500': 470, '501-1000': 540,
      '1001-1500': 610, '1501-2000': 680, '2001-2500': 750, '2501-3000': 820, '3001-3500': 890,
      '3501-4000': 960, '4001-4500': 1030, '4501-5000': 1100, '5001-5500': 1240, '5501-6000': 1380,
      '6001-6500': 1520, '6501-7000': 1660, '7001-7500': 1800, '7501-8000': 1940, '8001-8500': 2080,
      '8501-9000': 2220, '9001-9500': 2360, '9501-10000': 2500
    },
    grupo3: {
      // Sur América Y Caribe
      '1-20': 460, '21-50': 460, '51-100': 460, '101-250': 460, '251-500': 550, '501-1000': 640,
      '1001-1500': 730, '1501-2000': 820, '2001-2500': 910, '2501-3000': 1000, '3001-3500': 1090,
      '3501-4000': 1180, '4001-4500': 1270, '4501-5000': 1360, '5001-5500': 1450, '5501-6000': 1540,
      '6001-6500': 1630, '6501-7000': 1720, '7001-7500': 1810, '7501-8000': 1900, '8001-8500': 1990,
      '8501-9000': 2080, '9001-9500': 2170, '9501-10000': 2260
    },
    grupo4: {
      // Europa
      '1-20': 520, '21-50': 520, '51-100': 520, '101-250': 520, '251-500': 650, '501-1000': 760,
      '1001-1500': 870, '1501-2000': 980, '2001-2500': 1090, '2501-3000': 1200, '3001-3500': 1310,
      '3501-4000': 1420, '4001-4500': 1530, '4501-5000': 1640, '5001-5500': 1750, '5501-6000': 1860,
      '6001-6500': 1970, '6501-7000': 2080, '7001-7500': 2190, '7501-8000': 2300, '8001-8500': 2410,
      '8501-9000': 2520, '9001-9500': 2630, '9501-10000': 2740
    },
    grupo5: {
      // Resto del Mundo
      '1-20': 530, '21-50': 530, '51-100': 530, '101-250': 530, '251-500': 700, '501-1000': 840,
      '1001-1500': 980, '1501-2000': 1120, '2001-2500': 1260, '2501-3000': 1400, '3001-3500': 1540,
      '3501-4000': 1680, '4001-4500': 1820, '4501-5000': 1960, '5001-5500': 2100, '5501-6000': 2240,
      '6001-6500': 2380, '6501-7000': 2520, '7001-7500': 2660, '7501-8000': 2800, '8001-8500': 2940,
      '8501-9000': 3080, '9001-9500': 3220, '9501-10000': 3360
    }
  };

  // NUEVO: Función para calcular costo automáticamente
  calcularCosto() {
    if (!this.recibo.peso || this.recibo.peso <= 0) {
      this.recibo.costo = null;
      return;
    }

    const peso = this.recibo.peso;
    const grupo = this.recibo.grupo;
    const precios = this.tablaPrecios[grupo as keyof typeof this.tablaPrecios];
    
    // Encontrar el rango que corresponde al peso
    let rango = '';
    if (peso >= 1 && peso <= 20) rango = '1-20';
    else if (peso >= 21 && peso <= 50) rango = '21-50';
    else if (peso >= 51 && peso <= 100) rango = '51-100';
    else if (peso >= 101 && peso <= 250) rango = '101-250';
    else if (peso >= 251 && peso <= 500) rango = '251-500';
    else if (peso >= 501 && peso <= 1000) rango = '501-1000';
    else if (peso >= 1001 && peso <= 1500) rango = '1001-1500';
    else if (peso >= 1501 && peso <= 2000) rango = '1501-2000';
    else if (peso >= 2001 && peso <= 2500) rango = '2001-2500';
    else if (peso >= 2501 && peso <= 3000) rango = '2501-3000';
    else if (peso >= 3001 && peso <= 3500) rango = '3001-3500';
    else if (peso >= 3501 && peso <= 4000) rango = '3501-4000';
    else if (peso >= 4001 && peso <= 4500) rango = '4001-4500';
    else if (peso >= 4501 && peso <= 5000) rango = '4501-5000';
    else if (peso >= 5001 && peso <= 5500) rango = '5001-5500';
    else if (peso >= 5501 && peso <= 6000) rango = '5501-6000';
    else if (peso >= 6001 && peso <= 6500) rango = '6001-6500';
    else if (peso >= 6501 && peso <= 7000) rango = '6501-7000';
    else if (peso >= 7001 && peso <= 7500) rango = '7001-7500';
    else if (peso >= 7501 && peso <= 8000) rango = '7501-8000';
    else if (peso >= 8001 && peso <= 8500) rango = '8001-8500';
    else if (peso >= 8501 && peso <= 9000) rango = '8501-9000';
    else if (peso >= 9001 && peso <= 9500) rango = '9001-9500';
    else if (peso >= 9501 && peso <= 10000) rango = '9501-10000';
    else {
      this.recibo.costo = null;
      return;
    }

    // Obtener el costo del rango
    const costo = precios[rango as keyof typeof precios];
    if (costo) {
      this.recibo.costo = costo;
    }
  }

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
    // NUEVA VALIDACIÓN: Grupo geográfico
    if (!this.recibo.grupo || this.recibo.grupo.trim() === '') {
      this.errores['grupo'] = 'Seleccione un grupo geográfico';
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

    // Generar PDF y enviarlo por WhatsApp
    this.generarPDFYEnviarWhatsApp();
  }

  // NUEVA FUNCIÓN: Generar PDF del recibo
  generarPDF() {
    if (!this.reciboGenerado) {
      alert('Primero debe generar un recibo');
      return;
    }

    const elemento = document.getElementById('recibo-pdf-content');
    if (!elemento) {
      alert('No se encontró el elemento del recibo');
      return;
    }

    const nombreArchivo = `Recibo_${this.reciboGenerado.numero}.pdf`;

    // Ocultar los botones temporalmente
    const botonesDiv = elemento.querySelector('.no-print') as HTMLElement;
    const displayOriginal = botonesDiv?.style.display;
    if (botonesDiv) {
      botonesDiv.style.display = 'none';
    }

    html2canvas(elemento, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      // Restaurar los botones
      if (botonesDiv) {
        botonesDiv.style.display = displayOriginal || '';
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);
      pdf.save(nombreArchivo);
    }).catch(() => {
      // En caso de error, restaurar los botones
      if (botonesDiv) {
        botonesDiv.style.display = displayOriginal || '';
      }
    });
  }

  // NUEVA FUNCIÓN: Generar PDF y enviar por WhatsApp
  generarPDFYEnviarWhatsApp() {
    if (!this.reciboGenerado) {
      alert('Primero debe generar un recibo');
      return;
    }

    const elemento = document.getElementById('recibo-pdf-content');
    if (!elemento) {
      alert('No se encontró el elemento del recibo');
      return;
    }

    // Ocultar los botones temporalmente
    const botonesDiv = elemento.querySelector('.no-print') as HTMLElement;
    const displayOriginal = botonesDiv?.style.display;
    if (botonesDiv) {
      botonesDiv.style.display = 'none';
    }

    html2canvas(elemento, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      // Restaurar los botones
      if (botonesDiv) {
        botonesDiv.style.display = displayOriginal || '';
      }

      // Convertir canvas a imagen PNG
      const imagenURL = canvas.toDataURL('image/png');

      // Crear un mensaje de texto para acompañar
      const mensaje = `🧾 *RECIBO DE PAGO - CORREOS DE HONDURAS*\n\n*Recibo Nº:* ${this.reciboGenerado.numero}\n*Oficina:* ${this.reciboGenerado.oficina}\n*Fecha:* ${this.reciboGenerado.fechaPago}\n*Remitente:* ${this.reciboGenerado.remitente}\n*Destinatario:* ${this.reciboGenerado.destinatario}\n*Tipo de Servicio:* ${this.reciboGenerado.tipoServicio}\n*Tipo de Pago:* ${this.reciboGenerado.tipoPago || 'No especificado'}\n*Concepto:* ${this.reciboGenerado.concepto || 'No especificado'}\n*Peso:* ${this.reciboGenerado.peso || '0'} g\n*TOTAL A PAGAR:* L. ${(this.reciboGenerado.total || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n¡Gracias por usar los servicios de Correos de Honduras!`;

      const mensajeCodificado = encodeURIComponent(mensaje);

      // Crear un blob del PDF
      const canvas2 = canvas;
      const imgData = canvas2.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 10;
      const imgHeight = (canvas2.height * imgWidth) / canvas2.width;

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);

      // Convertir PDF a blob
      const pdfBlob = pdf.output('blob');

      // Verificar si es posible compartir (API de compartición)
      if (navigator.share) {
        navigator.share({
          title: `Recibo ${this.reciboGenerado.numero}`,
          text: 'Aquí está el recibo de pago en PDF',
          files: [
            new File([pdfBlob], `Recibo_${this.reciboGenerado.numero}.pdf`, {
              type: 'application/pdf',
            }),
          ],
        });
      } else {
        // Si no está disponible la API de compartición, descargar el PDF y abrir WhatsApp
        const linkDescarga = document.createElement('a');
        linkDescarga.href = URL.createObjectURL(pdfBlob);
        linkDescarga.download = `Recibo_${this.reciboGenerado.numero}.pdf`;
        linkDescarga.click();

        // Esperar un poco y luego abrir WhatsApp
        setTimeout(() => {
          const linkWhatsApp = `https://wa.me/?text=${mensajeCodificado}`;
          window.open(linkWhatsApp, '_blank');
        }, 500);
      }
    }).catch(() => {
      // En caso de error, restaurar los botones
      if (botonesDiv) {
        botonesDiv.style.display = displayOriginal || '';
      }
    });
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
      tipoPago: '',
      grupo: 'grupo1', // NUEVO
    };
    this.reciboGenerado = null;
    this.numeroRecibo = Math.floor(Math.random() * 1000000);
    this.errores = {};
  }
}