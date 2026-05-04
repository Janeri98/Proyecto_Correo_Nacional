import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Recibo {
  numero: number;
  oficina: string;
  fecha: string;
  remitente: string;
  destinatario: string;
  concepto: string;
  peso: number | null;
  costo: number | null;
  tipoServicio: string;
  tipoPago: string;
  grupo: string;
  fechaPago: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecibosStorageService {
  private readonly STORAGE_KEY = 'recibos_generados';
  private recibosSubject = new BehaviorSubject<Recibo[]>(this.cargarRecibosDelStorage());

  recibos$ = this.recibosSubject.asObservable();

  constructor() {
    // Cargar recibos al iniciar
    this.cargarRecibosDelStorage();
  }

  private cargarRecibosDelStorage(): Recibo[] {
    const recibosJSON = localStorage.getItem(this.STORAGE_KEY);
    return recibosJSON ? JSON.parse(recibosJSON) : [];
  }

  guardarRecibo(recibo: Recibo): void {
    const recibos = this.recibosSubject.value;
    recibos.push(recibo);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recibos));
    this.recibosSubject.next([...recibos]);
  }

  obtenerRecibos(): Recibo[] {
    return this.recibosSubject.value;
  }

  obtenerRecibos$(): Observable<Recibo[]> {
    return this.recibos$;
  }

  limpiarRecibos(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.recibosSubject.next([]);
  }

  private obtenerFechaRecibo(recibo: Recibo): string {
    return recibo.fechaPago || recibo.fecha;
  }

  obtenerRecibosPorFecha(fecha: string): Recibo[] {
    return this.recibosSubject.value.filter(r => this.obtenerFechaRecibo(r) === fecha);
  }

  obtenerRecibosPorMes(year: number, month: number): Recibo[] {
    const mesAno = `${year}-${String(month).padStart(2, '0')}`;
    return this.recibosSubject.value.filter(r => this.obtenerFechaRecibo(r).startsWith(mesAno));
  }

  obtenerRecibosPorPeriodo(fechaInicio: string, fechaFin: string): Recibo[] {
    return this.recibosSubject.value.filter(
      r => {
        const fecha = this.obtenerFechaRecibo(r);
        return fecha >= fechaInicio && fecha <= fechaFin;
      }
    );
  }
}
