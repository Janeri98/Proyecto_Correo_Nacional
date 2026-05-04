import { Injectable } from '@angular/core';
import { RecibosStorageService, Recibo } from './recibos-storage.service';

export interface Venta {
  id: number;
  numero: number;
  fecha: string;
  servicio: string;
  cantidad: number;
  monto: number;
  oficina: string;
  tipoPago: string;
}

export interface ReporteData {
  fecha: string;
  cantidad: number;
  monto: number;
  servicios: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  constructor(private recibosStorage: RecibosStorageService) {}

  obtenerVentas(): Venta[] {
    const recibos = this.recibosStorage.obtenerRecibos();
    return recibos.map((recibo, index) => ({
      id: index + 1,
      numero: recibo.numero || index + 1,
      fecha: recibo.fechaPago || recibo.fecha,
      servicio: recibo.tipoServicio,
      cantidad: 1,
      monto: Number(recibo.total) || 0,
      oficina: recibo.oficina,
      tipoPago: recibo.tipoPago || ''
    }));
  }

  obtenerRecibosPorPeriodo(fechaInicio: string, fechaFin: string): Recibo[] {
    return this.recibosStorage.obtenerRecibos().filter(recibo => {
      const fecha = recibo.fechaPago || recibo.fecha;
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  }

  obtenerReporteDiario(fecha: string): ReporteData {
    const ventas = this.obtenerVentas().filter(v => v.fecha === fecha);
    return {
      fecha,
      cantidad: ventas.length,
      monto: ventas.reduce((sum, v) => sum + v.monto, 0),
      servicios: [...new Set(ventas.map(v => v.servicio))]
    };
  }

  obtenerReporteMensual(year: number, month: number): ReporteData {
    const fechaInicio = `${year}-${String(month).padStart(2, '0')}-01`;
    const ventas = this.obtenerVentas().filter(v =>
      v.fecha.startsWith(`${year}-${String(month).padStart(2, '0')}`)
    );

    return {
      fecha: `${year}-${String(month).padStart(2, '0')}`,
      cantidad: ventas.length,
      monto: ventas.reduce((sum, v) => sum + v.monto, 0),
      servicios: [...new Set(ventas.map(v => v.servicio))]
    };
  }

  obtenerReportePeriodo(fechaInicio: string, fechaFin: string): Venta[] {
    return this.obtenerVentas().filter(
      v => v.fecha >= fechaInicio && v.fecha <= fechaFin
    );
  }

  obtenerResumenPorServicio(fechaInicio: string, fechaFin: string): any[] {
    const ventas = this.obtenerReportePeriodo(fechaInicio, fechaFin);
    const resumen: { [key: string]: { cantidad: number; monto: number } } = {};

    ventas.forEach(v => {
      if (!resumen[v.servicio]) {
        resumen[v.servicio] = { cantidad: 0, monto: 0 };
      }
      resumen[v.servicio].cantidad += v.cantidad;
      resumen[v.servicio].monto += v.monto;
    });

    return Object.entries(resumen).map(([servicio, datos]) => ({
      servicio,
      cantidad: datos.cantidad,
      monto: datos.monto
    }));
  }

  obtenerResumenPorOficina(fechaInicio: string, fechaFin: string): any[] {
    const ventas = this.obtenerReportePeriodo(fechaInicio, fechaFin);
    const resumen: { [key: string]: { cantidad: number; monto: number } } = {};

    ventas.forEach(v => {
      if (!resumen[v.oficina]) {
        resumen[v.oficina] = { cantidad: 0, monto: 0 };
      }
      resumen[v.oficina].cantidad += v.cantidad;
      resumen[v.oficina].monto += v.monto;
    });

    return Object.entries(resumen).map(([oficina, datos]) => ({
      oficina,
      cantidad: datos.cantidad,
      monto: datos.monto
    }));
  }

  obtenerReportePorDia(fechaInicio: string, fechaFin: string): any[] {
    const ventas = this.obtenerReportePeriodo(fechaInicio, fechaFin);
    const resumen: { [key: string]: { cantidad: number; monto: number } } = {};

    ventas.forEach(v => {
      if (!resumen[v.fecha]) {
        resumen[v.fecha] = { cantidad: 0, monto: 0 };
      }
      resumen[v.fecha].cantidad += v.cantidad;
      resumen[v.fecha].monto += v.monto;
    });

    return Object.entries(resumen)
      .map(([fecha, datos]) => ({
        fecha,
        cantidad: datos.cantidad,
        monto: datos.monto
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
}
