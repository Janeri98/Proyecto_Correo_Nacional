import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RecibosStorageService, Recibo } from './recibos-storage.service';
import { AuthService } from './auth.service';

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
  private readonly apiBaseUrl = 'http://localhost:3000/api'; // Cambia esta URL por la de tu API real.

  // Mapa de departamentos -> municipios (Honduras)
  private municipiosPorDepartamento: { [dept: string]: string[] } = {
    'Atlántida': ['La Ceiba','Tela','Jutiapa','Olanchito','Arizona','San Francisco'],
    'Choluteca': ['Choluteca','San Marcos de Colón','Pespire','Morolica','Namasigüe'],
    'Colón': ['Trujillo','Tocoa','Bonito Oriental','Balfate','Sonaguera'],
    'Comayagua': ['Comayagua','Siguatepeque','La Libertad','San José de Comayagua'],
    'Copán': ['Santa Rosa de Copán','San Pedro Sula','La Entrada','Copán Ruinas'],
    'Cortés': ['San Pedro Sula','Choloma','La Lima','Omoa','Puerto Cortés'],
    'El Paraíso': ['Yuscarán','Danlí','El Paraíso','Trojes'],
    'Francisco Morazán': ['Tegucigalpa','Comayagüela','La Esperanza','Talanga'],
    'Gracias a Dios': ['Puerto Lempira','Brus Laguna'],
    'Intibucá': ['La Esperanza','Intibucá','Ercilia Pepín'],
    'Islas de la Bahía': ['Roatán','Utila','Guanaja'],
    'La Paz': ['La Paz','Marcala','San Antonio'],
    'Lempira': ['Gracias','Gracias a Dios','San Juan'],
    'Ocotepeque': ['Ocotepeque','Sinuapa','Concepción'],
    'Olancho': ['Juticalpa','Catacamas','Campamento','La Unión'],
    'Santa Bárbara': ['Santa Bárbara','Choluteca','San Pedro Zacapa'],
    'Valle': ['Nacaome','Langue','San Lorenzo'],
    'Yoro': ['Yoro','El Progreso','Olanchito']
  };

  constructor(
    private recibosStorage: RecibosStorageService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  obtenerVentas(): Venta[] {
    const usuario = this.authService.getUsuarioActual();
    let recibos = this.recibosStorage.obtenerRecibos();

    if (usuario && !this.authService.tienePermiso(usuario)) {
      return []; // Usuario no puede ver reportes
    }

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
    const usuario = this.authService.getUsuarioActual();
    let recibos = this.recibosStorage.obtenerRecibos().filter(recibo => {
      const fecha = recibo.fechaPago || recibo.fecha;
      return fecha >= fechaInicio && fecha <= fechaFin;
    });

    if (usuario && !this.authService.tienePermiso(usuario)) {
      return []; // Usuario no puede ver reportes
    }

    return recibos;
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

  obtenerReporteFiltrado(
    fechaInicio: string,
    fechaFin: string,
    municipio?: string,
    departamento?: string
  ): Venta[] {
    let recibos = this.recibosStorage.obtenerRecibos().filter(recibo => {
      const fecha = recibo.fechaPago || recibo.fecha;
      let cumpleFecha = fecha >= fechaInicio && fecha <= fechaFin;
      let cumpleMunicipio = !municipio || recibo.municipio === municipio;
      let cumpleDepartamento = !departamento || recibo.departamento === departamento;
      return cumpleFecha && cumpleMunicipio && cumpleDepartamento;
    });

    const usuario = this.authService.getUsuarioActual();
    if (usuario && !this.authService.tienePermiso(usuario)) {
      return []; // Usuario no puede ver reportes
    }

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

  obtenerCierresDia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/cierres`).pipe(
      catchError(() => of(this.getLocalCierresDia()))
    );
  }

  obtenerDiasCerrados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiBaseUrl}/dias-cerrados`).pipe(
      catchError(() => of(this.getLocalDiasCerrados()))
    );
  }

  guardarCierreDia(cierre: any): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/cierres`, cierre).pipe(
      catchError(() => {
        const cierres = this.getLocalCierresDia();
        cierres.push(cierre);
        localStorage.setItem('cierresDia', JSON.stringify(cierres));
        return of(cierre);
      })
    );
  }

  marcarDiaCerrado(fecha: string): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/dias-cerrados`, { fecha }).pipe(
      catchError(() => {
        const diasCerrados = this.getLocalDiasCerrados();
        if (!diasCerrados.includes(fecha)) {
          diasCerrados.push(fecha);
          localStorage.setItem('diasCerrados', JSON.stringify(diasCerrados));
        }
        return of({ fecha });
      })
    );
  }

  private getLocalCierresDia(): any[] {
    return JSON.parse(localStorage.getItem('cierresDia') || '[]');
  }

  private getLocalDiasCerrados(): string[] {
    return JSON.parse(localStorage.getItem('diasCerrados') || '[]');
  }

  obtenerMunicipios(): string[] {
    const recibos = this.recibosStorage.obtenerRecibos();
    const desdeRecibos = [...new Set(recibos.map(r => r.municipio).filter(m => m))];
    // Unir municipios detectados con el mapa completo
    const mapaTodos = Object.values(this.municipiosPorDepartamento).flat();
    const unidos = Array.from(new Set([...mapaTodos, ...desdeRecibos]));
    return unidos.sort((a, b) => a.localeCompare(b));
  }

  obtenerMunicipiosPorDepartamento(departamento?: string): string[] {
    if (!departamento || departamento.trim() === '') {
      // devolver todos los municipios
      return Object.values(this.municipiosPorDepartamento).flat().sort((a, b) => a.localeCompare(b));
    }
    const lista = this.municipiosPorDepartamento[departamento] || [];
    return lista.slice().sort((a, b) => a.localeCompare(b));
  }

  obtenerDepartamentos(): string[] {
    const recibos = this.recibosStorage.obtenerRecibos();
    return [...new Set(recibos.map(r => r.departamento).filter(d => d))];
  }
}
