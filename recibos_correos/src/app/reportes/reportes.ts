import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../services/reportes.service';
import { RecibosStorageService } from '../services/recibos-storage.service';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import jsPDF from 'jspdf';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

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
  municipioSeleccionado: string = '';
  departamentoSeleccionado: string = '';

  municipios: string[] = [];
  departamentos: string[] = [];

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
  mostrarModalCierreDia: boolean = false;
  diaCerrado: boolean = false;
  cierresDia: any[] = [];
  mensajeCierreExito: string = '';
  usuarioActualNombre: string = '';
  usuarioActualRol: string = '';
  esAdministrador: boolean = false;
  esSupervisor: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private reportesService: ReportesService,
    private recibosStorage: RecibosStorageService,
    private authService: AuthService
  ) {
    this.fechaSeleccionada = this.obtenerFechaHoy();
    this.monthSeleccionado = this.obtenerMesActual();
    this.fechaInicio = this.obtenerFechaHoy();
    this.fechaFin = this.obtenerFechaHoy();
    this.cargarFiltros();
  }

  private cargarFiltros(): void {
    this.municipios = this.reportesService.obtenerMunicipios();

    // Lista completa de departamentos de Honduras (fallback)
    const departamentosTodos = [
      'Atlántida','Choluteca','Colón','Comayagua','Copán','Cortés','El Paraíso',
      'Francisco Morazán','Gracias a Dios','Intibucá','Islas de la Bahía','La Paz',
      'Lempira','Ocotepeque','Olancho','Santa Bárbara','Valle','Yoro'
    ];

    const detectados = this.reportesService.obtenerDepartamentos() || [];
    // Unir departamentos detectados con la lista completa, manteniendo orden y sin duplicados
    const unidos = Array.from(new Set([...departamentosTodos, ...detectados]));
    this.departamentos = unidos.sort((a, b) => a.localeCompare(b));
  }

  onDepartamentoChange(): void {
    this.municipios = this.reportesService.obtenerMunicipiosPorDepartamento(this.departamentoSeleccionado);
    // Si el usuario ya tiene un municipio seleccionado que no pertenece al nuevo departamento, limpiarlo
    if (!this.municipios.includes(this.municipioSeleccionado)) {
      this.municipioSeleccionado = '';
    }
    this.cargarReporte();
  }

  private cargarUsuarioActual(): void {
    const usuario = this.authService.getUsuarioActual();
    // usar valores de authService cuando existan, si no, revisar localStorage
    const nombreLS = localStorage.getItem('usuarioActual');
    const rolLS = localStorage.getItem('usuarioRol');
    const deptLS = localStorage.getItem('usuarioDepartamento');
    const munLS = localStorage.getItem('usuarioMunicipio');

    this.usuarioActualNombre = usuario?.nombre || nombreLS || 'Desconocido';
    this.usuarioActualRol = usuario?.rol || rolLS || '';
    this.esAdministrador = (usuario?.rol === 'Administrador' || usuario?.rol === 'Superadministrador') || (rolLS === 'Administrador' || rolLS === 'Superadministrador');
    this.esSupervisor = (usuario?.rol === 'Supervisor') || (rolLS === 'Supervisor');

    if (this.esSupervisor) {
      this.departamentoSeleccionado = usuario?.departamento || deptLS || this.departamentoSeleccionado;
      this.municipioSeleccionado = usuario?.municipio || munLS || this.municipioSeleccionado;
      // Precargar lista de municipios para el departamento del supervisor
      if (this.departamentoSeleccionado) {
        this.municipios = this.reportesService.obtenerMunicipiosPorDepartamento(this.departamentoSeleccionado);
      }
    }
  }

  private verificarDiaCerrado(): void {
    const fechaVerificar = this.tipoReporte === 'diario'
      ? (this.fechaSeleccionada || this.obtenerFechaHoy())
      : this.obtenerFechaHoy();

    this.reportesService.obtenerDiasCerrados()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (diasCerrados: string[]) => {
          const estaCerrado = diasCerrados.includes(fechaVerificar);
          this.diaCerrado = estaCerrado;
          console.log('=== verificarDiaCerrado ===');
          console.log('fechaVerificar:', fechaVerificar);
          console.log('diasCerrados:', diasCerrados);
          console.log('diaCerrado:', this.diaCerrado);
        },
        (error) => {
          console.error('Error al verificar día cerrado:', error);
          // Fallback a localStorage
          const diasCerrados = JSON.parse(localStorage.getItem('diasCerrados') || '[]');
          this.diaCerrado = diasCerrados.includes(fechaVerificar);
        }
      );
  }

  ngOnInit(): void {
    this.cargarUsuarioActual();
    this.verificarDiaCerrado();
    this.cargarCierresDia();
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
    console.log('=== INICIO cargarReporte ===');
    console.log('tipoReporte:', this.tipoReporte);
    console.log('fechaSeleccionada:', this.fechaSeleccionada);

    if (this.tipoReporte === 'diario') {
      const fecha = this.fechaSeleccionada || this.obtenerFechaHoy();
      this.fechaSeleccionada = fecha;
      this.mensajeCierreExito = '';
      console.log('Cargando reporte diario para fecha:', fecha);
      const ventas = this.reportesService.obtenerReporteFiltrado(
        fecha,
        fecha,
        this.municipioSeleccionado,
        this.departamentoSeleccionado
      );
      this.ventasTabla = ventas;
      this.calcularTotales(ventas);
      console.log('Ventas obtenidas:', ventas.length);
      console.log('Total ventas:', this.totalVentas);
      console.log('Total monto:', this.totalMonto);
      this.resumenServicio = this.reportesService.obtenerResumenPorServicio(
        this.fechaSeleccionada,
        this.fechaSeleccionada
      );
      this.resumenOficina = this.reportesService.obtenerResumenPorOficina(
        this.fechaSeleccionada,
        this.fechaSeleccionada
      );
    } else if (this.tipoReporte === 'mensual') {
      const mes = this.monthSeleccionado || this.obtenerMesActual();
      this.monthSeleccionado = mes;
      const [year, month] = mes.split('-');
      const primerDia = `${year}-${month}-01`;
      const ultimoDia = new Date(parseInt(year), parseInt(month), 0)
        .toISOString()
        .split('T')[0];

      const ventas = this.reportesService.obtenerReporteFiltrado(
        primerDia,
        ultimoDia,
        this.municipioSeleccionado,
        this.departamentoSeleccionado
      );
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
      const inicio = this.fechaInicio || this.obtenerFechaHoy();
      const fin = this.fechaFin || inicio;
      this.fechaInicio = inicio;
      this.fechaFin = fin;
      const ventas = this.reportesService.obtenerReporteFiltrado(
        inicio,
        fin,
        this.municipioSeleccionado,
        this.departamentoSeleccionado
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
    this.verificarDiaCerrado();
    this.cargarCierresDia();
    console.log('diaCerrado después de verificar:', this.diaCerrado);
    console.log('=== FIN cargarReporte ===');
  }

  private calcularTotales(ventas: any[]): void {
    this.totalVentas = ventas.length;
    this.totalMonto = ventas.reduce((sum, v) => sum + (Number(v.monto) || 0), 0);
  }

  private cargarCierresDia(): void {
    const usuarioFiltro = this.usuarioActualNombre || localStorage.getItem('usuarioActual') || 'Desconocido';
    this.reportesService.obtenerCierresDia()
      .pipe(takeUntil(this.destroy$))
      .subscribe((todosCierres: any[]) => {
        this.cierresDia = this.esAdministrador
          ? todosCierres
          : todosCierres.filter((cierre: any) => cierre.usuario === usuarioFiltro);
      });
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

  abrirModalCierreDia(): void {
    console.log('=== INICIO abrirModalCierreDia ===');
    console.log('Botón Cerrar Día clickeado');
    console.log('tipoReporte:', this.tipoReporte);
    console.log('ventasTabla.length:', this.ventasTabla.length);
    console.log('diaCerrado:', this.diaCerrado);
    console.log('totalVentas:', this.totalVentas);
    console.log('totalMonto:', this.totalMonto);

    // Asegurar que la fecha seleccionada esté definida cuando es reporte diario
    if (this.tipoReporte === 'diario') {
      this.fechaSeleccionada = this.fechaSeleccionada || this.obtenerFechaHoy();
      // Verificar si esa fecha ya está cerrada
      this.verificarDiaCerrado();
      
      // Pequeña pausa para permitir que verificarDiaCerrado se complete
      setTimeout(() => {
        if (this.tipoReporte === 'diario' && this.ventasTabla.length > 0 && !this.diaCerrado) {
          console.log('Abriendo modal de cierre de día');
          this.mostrarModalCierreDia = true;
        } else if (this.ventasTabla.length === 0) {
          console.log('No hay transacciones');
          alert('No hay transacciones para cerrar el día.');
        } else if (this.diaCerrado) {
          console.log('El día ya está cerrado para la fecha seleccionada');
          alert('El día seleccionado ya fue cerrado.');
        } else {
          console.log('Condición inesperada');
          alert('No se puede cerrar el día en este momento.');
        }
        console.log('=== FIN abrirModalCierreDia ===');
      }, 100);
    } else {
      console.log('No es reporte diario');
      alert('Solo puedes cerrar el día desde el reporte diario.');
      console.log('=== FIN abrirModalCierreDia ===');
    }
  }

  confirmarCierreDia(): void {
    const fechaCierreDia = this.tipoReporte === 'diario'
      ? (this.fechaSeleccionada || this.obtenerFechaHoy())
      : this.obtenerFechaHoy();
    const fechaHoraCierre = new Date();
    const horaCierre = fechaHoraCierre.toTimeString().split(' ')[0];

    const resumenCierre = {
      fecha: fechaCierreDia,
      horaCierre,
      totalTransacciones: this.totalVentas,
      totalMonto: this.totalMonto,
      fechaCierre: fechaHoraCierre.toISOString(),
      usuario: this.usuarioActualNombre || localStorage.getItem('usuarioActual') || 'Desconocido',
      departamento: localStorage.getItem('usuarioDepartamento') || 'N/A',
      municipio: localStorage.getItem('usuarioMunicipio') || 'N/A'
    };

    console.log('Guardando cierre de día:', resumenCierre);

    this.reportesService.marcarDiaCerrado(fechaCierreDia)
      .pipe(
        switchMap(() => this.reportesService.guardarCierreDia(resumenCierre)),
        takeUntil(this.destroy$)
      )
      .subscribe(
        () => {
          console.log('Cierre de día guardado exitosamente');
          // Actualizar datos después del cierre
          this.diaCerrado = true;
          this.mostrarModalCierreDia = false;
          this.cargarCierresDia();
          this.verificarDiaCerrado();
          
          // Mostrar mensaje de éxito
          this.mensajeCierreExito = `✓ Día ${fechaCierreDia} cerrado correctamente. Total ${this.simboloMoneda}${this.totalMonto.toFixed(2)} en ${this.totalVentas} transacciones.`;
          alert(`✓ Día cerrado correctamente.\n\nFecha: ${fechaCierreDia}\nHora: ${horaCierre}\nTotal: ${this.simboloMoneda}${this.totalMonto.toFixed(2)}\nTransacciones: ${this.totalVentas}`);
          
          // Limpiar mensaje de éxito después de 5 segundos
          setTimeout(() => {
            this.mensajeCierreExito = '';
          }, 5000);
        },
        (error) => {
          console.error('Error al cerrar el día:', error);
          alert('Error al cerrar el día. Por favor, intenta de nuevo.');
        }
      );
  }

  cancelarCierreDia(): void {
    this.mostrarModalCierreDia = false;
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
        ['Recibo', 'Fecha', 'Servicio', 'Monto', 'Oficina'],
        this.ventasTabla.map((v: any) => [
          v.numero?.toString() || '',
          v.fecha,
          v.servicio.substring(0, 20),
          `${this.simboloMoneda}${(Number(v.monto) || 0).toFixed(2)}`,
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
    const colWidths = [20, 30, 60, 30, 30];
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
    let csv = '\uFEFF';

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
    csv += 'Recibo,Fecha,Servicio,Monto,Oficina,Tipo de Pago\n';
    this.ventasTabla.forEach((v: any) => {
      const monto = Number(v.monto) || 0;
      csv += `${v.numero || ''},${v.fecha},"${v.servicio}",${monto.toFixed(2)},"${v.oficina}","${v.tipoPago || ''}"\n`;
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

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
