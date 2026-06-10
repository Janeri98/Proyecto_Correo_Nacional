import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-descargar-recibo',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Descargando recibo...</div>`,
  styles: [`div { text-align: center; padding: 20px; }`]
})
export class DescargarReciboComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const numeroRecibo = params['numero'];
      this.descargarRecibo(numeroRecibo);
    });
  }

  private descargarRecibo(numeroRecibo: string) {
    // Recuperar los datos del recibo desde sessionStorage
    const reciboJSON = sessionStorage.getItem(`recibo_${numeroRecibo}`);
    
    if (!reciboJSON) {
      alert('Recibo no encontrado. Por favor, genera un nuevo recibo.');
      this.router.navigate(['/recibo']);
      return;
    }

    try {
      const recibo = JSON.parse(reciboJSON);
      this.generarPDFDesdeRecibo(recibo);
    } catch (error) {
      console.error('Error al procesar el recibo:', error);
      alert('Error al descargar el recibo');
      this.router.navigate(['/recibo']);
    }
  }

  private generarPDFDesdeRecibo(recibo: any) {
    // Crear un elemento HTML invisible con el contenido del recibo
    const contenedorHTML = document.createElement('div');
    contenedorHTML.style.position = 'absolute';
    contenedorHTML.style.left = '-9999px';
    contenedorHTML.innerHTML = this.generarHTMLRecibo(recibo);
    document.body.appendChild(contenedorHTML);

    const elemento = contenedorHTML.querySelector('#recibo-print');
    if (!elemento) {
      alert('Error al generar el recibo');
      document.body.removeChild(contenedorHTML);
      this.router.navigate(['/recibo']);
      return;
    }

    html2canvas(elemento as HTMLElement, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);
      pdf.save(`Recibo_${recibo.numero}.pdf`);

      // Limpiar
      document.body.removeChild(contenedorHTML);
      this.router.navigate(['/recibo']);
    }).catch((error) => {
      console.error('Error generando PDF:', error);
      document.body.removeChild(contenedorHTML);
      this.router.navigate(['/recibo']);
    });
  }

  private generarHTMLRecibo(recibo: any): string {
    const moneda = new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    });

    return `
      <div id="recibo-print" style="width: 800px; background: white; padding: 40px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h2 style="margin: 0; color: #1a5276;">CORREOS DE HONDURAS</h2>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">RECIBO DE PAGO - INGRESOS CORRIENTES "TESORERÍA"</p>
          <h3 style="margin: 10px 0; color: #333;">RECIBO Nº ${recibo.numero}</h3>
        </div>

        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Oficina/Agencia:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${recibo.oficina || 'No especificada'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Fecha de Pago:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${recibo.fechaPago}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tipo de Servicio:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${recibo.tipoServicio || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tipo de Pago:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${recibo.tipoPago || 'No especificado'}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Concepto:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${recibo.concepto || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Peso:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${recibo.peso || '0'} g</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #1a5276; color: white; text-align: center; border-radius: 5px;">
          <h3 style="margin: 0;">TOTAL A PAGAR</h3>
          <h2 style="margin: 10px 0; font-size: 24px;">L. ${(recibo.total || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #999;">
          <p>Documento generado automáticamente por el Sistema de Recibos</p>
          <p>Correos de Honduras - Todos los derechos reservados</p>
        </div>
      </div>
    `;
  }
}
