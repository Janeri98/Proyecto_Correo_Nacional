import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../services/reportes.service';
import { RecibosStorageService } from '../services/recibos-storage.service';
import { HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit, OnDestroy {
  @ViewChild('reporteContent', { static: false }) reporteContent!: ElementRef;

  tipoReporte: 'diario' | 'mensual' | 'personalizado' = 'diario';
  fechaSeleccionada: string = '';
  monthSeleccionado: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  ventasTabla: any[] = [];
  resumenServicio: any[] = [];
  resumenOficina: any[] = [];
  reportePorDia: any[] = [];
  totalVentas: number = 0;
  totalMonto: number = 0;

  mostrarTabla: boolean = true;
  mostrarGraficos: boolean = true;
  moneda: string = 'HNL';
  simboloMoneda: string = 'L. ';

  private destroy$ = new Subject<void>();

  constructor(
    private reportesService: ReportesService,
    private recibosStorage: RecibosStorageService
  ) {
    this.fechaSeleccionada = this.obtenerFechaHoy();
    this.monthSeleccionado = this.obtenerMesActual();
    this.fechaInicio = this.obtenerFechaHoy();
    this.fechaFin = this.obtenerFechaHoy();
  }

  ngOnInit(): void {
    this.cargarReporte();
    this.recibosStorage.recibos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarReporte();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarReporte(): void {
    if (this.tipoReporte === 'diario') {
      const ventas = this.reportesService.obtenerReportePeriodo(
        this.fechaSeleccionada,
        this.fechaSeleccionada
      );
      this.ventasTabla = ventas;
      this.calcularTotales(ventas);
      this.resumenServicio = this.reportesService.obtenerResumenPorServicio(
        this.fechaSeleccionada,
        this.fechaSeleccionada
      );
      this.resumenOficina = this.reportesService.obtenerResumenPorOficina(
        this.fechaSeleccionada,
        this.fechaSeleccionada
      );
    } else if (this.tipoReporte === 'mensual') {
      const [year, month] = this.monthSeleccionado.split('-');
      const primerDia = `${year}-${month}-01`;
      const ultimoDia = new Date(parseInt(year), parseInt(month), 0)
        .toISOString()
        .split('T')[0];

      const ventas = this.reportesService.obtenerReportePeriodo(primerDia, ultimoDia);
      this.ventasTabla = ventas;
      this.calcularTotales(ventas);
      this.resumenServicio = this.reportesService.obtenerResumenPorServicio(
        primerDia,
        ultimoDia
      );
      this.resumenOficina = this.reportesService.obtenerResumenPorOficina(
        primerDia,
        ultimoDia
      );
      this.reportePorDia = this.reportesService.obtenerReportePorDia(primerDia, ultimoDia);
    } else {
      const ventas = this.reportesService.obtenerReportePeriodo(
        this.fechaInicio,
        this.fechaFin
      );
      this.ventasTabla = ventas;
      this.calcularTotales(ventas);
      this.resumenServicio = this.reportesService.obtenerResumenPorServicio(
        this.fechaInicio,
        this.fechaFin
      );
      this.resumenOficina = this.reportesService.obtenerResumenPorOficina(
        this.fechaInicio,
        this.fechaFin
      );
      this.reportePorDia = this.reportesService.obtenerReportePorDia(
        this.fechaInicio,
        this.fechaFin
      );
    }
  }

  private calcularTotales(ventas: any[]): void {
    this.totalVentas = ventas.length;
    this.totalMonto = ventas.reduce((sum, v) => sum + v.monto, 0);
  }

  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obtenerMesActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  exportarPDF(): void {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 10;
    const margin = 10;

    // Título
    doc.setFontSize(16);
    doc.text('Reporte de Ventas', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Información del reporte
    doc.setFontSize(10);
    if (this.tipoReporte === 'diario') {
      doc.text(`Fecha: ${this.fechaSeleccionada}`, margin, currentY);
    } else if (this.tipoReporte === 'mensual') {
      doc.text(`Período: ${this.monthSeleccionado}`, margin, currentY);
    } else {
      doc.text(`Período: ${this.fechaInicio} a ${this.fechaFin}`, margin, currentY);
    }
    currentY += 8;

    // Totales
    doc.text(`Total Transacciones: ${this.totalVentas}`, margin, currentY);
    currentY += 5;
    doc.text(`Total Monto: ${this.simboloMoneda}${this.totalMonto.toFixed(2)}`, margin, currentY);
    currentY += 12;

    // Tabla de Ventas Detalladas
    if (this.ventasTabla.length > 0) {
      doc.setFontSize(12);
      doc.text('Detalle de Ventas', margin, currentY);
      currentY += 8;

      this.dibujarTablaEnPDF(
        doc,
        currentY,
        ['Fecha', 'Servicio', 'Cantidad', 'Monto', 'Oficina'],
        this.ventasTabla.map((v: any) => [
          v.fecha,
          v.servicio.substring(0, 20),
          v.cantidad.toString(),
          `${this.simboloMoneda}${v.monto.toFixed(2)}`,
          v.oficina
        ])
      );

      currentY += 60;
    }

    // Tabla de Resumen por Servicio
    if (this.resumenServicio.length > 0 && currentY < pageHeight - 40) {
      doc.addPage();
      currentY = 10;
      doc.setFontSize(12);
      doc.text('Resumen por Servicio', margin, currentY);
      currentY += 8;

      this.dibujarTablaEnPDF(
        doc,
        currentY,
        ['Servicio', 'Cantidad', 'Monto'],
        this.resumenServicio.map((r: any) => [
          r.servicio.substring(0, 25),
          r.cantidad.toString(),
          `${this.simboloMoneda}${r.monto.toFixed(2)}`
        ])
      );

      currentY += 40;
    }

    // Tabla de Resumen por Oficina
    if (this.resumenOficina.length > 0) {
      doc.setFontSize(12);
      doc.text('Resumen por Oficina', margin, currentY);
      currentY += 8;

      this.dibujarTablaEnPDF(
        doc,
        currentY,
        ['Oficina', 'Cantidad', 'Monto'],
        this.resumenOficina.map((r: any) => [
          r.oficina,
          r.cantidad.toString(),
          `${this.simboloMoneda}${r.monto.toFixed(2)}`
        ])
      );
    }

    doc.save(`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private dibujarTablaEnPDF(doc: any, startY: number, headers: string[], rows: string[][]): void {
    const margin = 10;
    const cellHeight = 6;
    const colWidths = [30, 50, 20, 30, 30];
    let currentY = startY;

    // Encabezados
    doc.setFont(undefined, 'bold');
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);
    let currentX = margin;
    headers.forEach((header: string, i: number) => {
      doc.rect(currentX, currentY - cellHeight + 1, colWidths[i], cellHeight, 'F');
      doc.text(header, currentX + 2, currentY - 1, { maxWidth: colWidths[i] - 2 });
      currentX += colWidths[i];
    });

    currentY += cellHeight;

    // Filas
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    rows.forEach((row: string[], rowIndex: number) => {
      currentX = margin;
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, currentY - cellHeight + 1, 160, cellHeight, 'F');
      }
      row.forEach((cell: string, colIndex: number) => {
        doc.text(cell, currentX + 2, currentY - 1, {
          maxWidth: colWidths[colIndex] - 4
        });
        currentX += colWidths[colIndex];
      });
      currentY += cellHeight;
    });
  }

  exportarExcel(): void {
    let csv = 'data:text/csv;charset=utf-8,';

    // Encabezado
    if (this.tipoReporte === 'diario') {
      csv += `Reporte de Ventas - ${this.fechaSeleccionada}\n`;
    } else if (this.tipoReporte === 'mensual') {
      csv += `Reporte de Ventas - ${this.monthSeleccionado}\n`;
    } else {
      csv += `Reporte de Ventas - ${this.fechaInicio} a ${this.fechaFin}\n`;
    }
    csv += `\nTotal Transacciones,${this.totalVentas}\n`;
    csv += `Total Monto,${this.simboloMoneda}${this.totalMonto.toFixed(2)}\n\n`;

    // Tabla detallada
    csv += 'Fecha,Servicio,Cantidad,Monto,Oficina\n';
    this.ventasTabla.forEach((v: any) => {
      csv += `${v.fecha},"${v.servicio}",${v.cantidad},${v.monto.toFixed(2)},"${v.oficina}"\n`;
    });

    csv += '\n\nResumen por Servicio\n';
    csv += 'Servicio,Cantidad,Monto\n';
    this.resumenServicio.forEach((r: any) => {
      csv += `"${r.servicio}",${r.cantidad},${r.monto.toFixed(2)}\n`;
    });

    csv += '\n\nResumen por Oficina\n';
    csv += 'Oficina,Cantidad,Monto\n';
    this.resumenOficina.forEach((r: any) => {
      csv += `"${r.oficina}",${r.cantidad},${r.monto.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.click();
  }
}
