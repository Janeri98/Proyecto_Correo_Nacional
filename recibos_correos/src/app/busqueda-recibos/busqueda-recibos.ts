import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RecibosStorageService, Recibo } from '../services/recibos-storage.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-busqueda-recibos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './busqueda-recibos.html',
  styleUrls: ['./busqueda-recibos.css']
})
export class BusquedaRecibosComponent implements OnInit {
  recibos: Recibo[] = [];
  recibosFiltered: Recibo[] = [];
  
  filtro = {
    numero: '',
    fecha: '',
    destinatario: '',
    fechaInicio: '',
    fechaFin: '',
    tipoServicio: ''
  };

  estadisticas = {
    totalRecibos: 0,
    totalRecibosHoy: 0,
    montoTotalHoy: 0,
    montoTotal: 0
  };

  usuarioActual: any = null;
  mostrarEstadisticas = false;
  esVentanilla = false;
  esAdministrador = false;

  constructor(
    private recibosStorageService: RecibosStorageService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.getUsuarioActual();
    
    // Determinar el rol del usuario
    if (this.usuarioActual) {
      this.esVentanilla = this.usuarioActual.rol === 'Ventanilla';
      this.esAdministrador = this.authService.esAdministrador(this.usuarioActual);
    }
    
    this.cargarRecibos();
  }

  cargarRecibos() {
    try {
      this.recibos = this.recibosStorageService.obtenerRecibos();
      this.recibosFiltered = [...this.recibos];
      console.log('Recibos cargados:', this.recibos.length);
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al cargar recibos:', error);
      this.recibos = [];
      this.recibosFiltered = [];
    }
  }

  buscar() {
    console.log('Buscando con filtros:', this.filtro);
    console.log('Total de recibos:', this.recibos.length);
    
    this.recibosFiltered = this.recibos.filter(recibo => {
      const cumpleNumero = !this.filtro.numero || 
        (recibo.numero?.toString().includes(this.filtro.numero));
      
      const cumpleFecha = !this.filtro.fecha || 
        (this.obtenerFecha(recibo)?.includes(this.filtro.fecha));
      
      const cumpleDestinatario = !this.filtro.destinatario || 
        ((recibo.destinatario && typeof recibo.destinatario === 'string') ? 
          recibo.destinatario.toLowerCase().includes(this.filtro.destinatario.toLowerCase()) : 
          false);

      const cumpleTipo = !this.filtro.tipoServicio || 
        ((recibo.tipoServicio && typeof recibo.tipoServicio === 'string') ? 
          recibo.tipoServicio.toLowerCase().includes(this.filtro.tipoServicio.toLowerCase()) : 
          false);

      let cumpleRangoFechas = true;
      if (this.filtro.fechaInicio && this.filtro.fechaFin) {
        const fechaRecibo = new Date(this.obtenerFecha(recibo) || '');
        const inicio = new Date(this.filtro.fechaInicio);
        const fin = new Date(this.filtro.fechaFin);
        cumpleRangoFechas = fechaRecibo >= inicio && fechaRecibo <= fin;
      }

      return cumpleNumero && cumpleFecha && cumpleDestinatario && cumpleTipo && cumpleRangoFechas;
    });

    console.log('Resultados encontrados:', this.recibosFiltered.length);
    this.calcularEstadisticas();
  }

  // Búsqueda en tiempo real para ventanilla
  buscarEnTiempoReal() {
    this.buscar();
  }

  calcularEstadisticas() {
    const hoy = new Date().toISOString().split('T')[0];
    
    this.estadisticas.totalRecibos = this.recibosFiltered.length;
    this.estadisticas.montoTotal = this.recibosFiltered.reduce((sum, r) => sum + (r.total || r.costo || 0), 0);
    
    const recibosHoy = this.recibosFiltered.filter(r => 
      this.obtenerFecha(r)?.includes(hoy)
    );
    
    this.estadisticas.totalRecibosHoy = recibosHoy.length;
    this.estadisticas.montoTotalHoy = recibosHoy.reduce((sum, r) => sum + (r.total || r.costo || 0), 0);
  }

  obtenerFecha(recibo: Recibo): string {
    return recibo.fechaPago || recibo.fecha || '';
  }

  limpiarFiltros() {
    this.filtro = {
      numero: '',
      fecha: '',
      destinatario: '',
      fechaInicio: '',
      fechaFin: '',
      tipoServicio: ''
    };
    this.recibosFiltered = [...this.recibos];
    this.calcularEstadisticas();
  }

  exportarResultados() {
    const csv = this.generarCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recibos-busqueda-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generarCSV(): string {
    let csv = 'Número,Fecha,Destinatario,Concepto,Monto,Tipo Servicio,Oficina,Departamento\n';
    this.recibosFiltered.forEach(recibo => {
      csv += `"${recibo.numero}","${this.obtenerFecha(recibo)}","${recibo.destinatario}","${recibo.concepto}","${recibo.total || recibo.costo}","${recibo.tipoServicio}","${recibo.oficina}","${recibo.departamento}"\n`;
    });
    return csv;
  }

  toggleEstadisticas() {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
  }

  descargarRecibo(recibo: Recibo) {
    const apiUrlRecibos = `http://${window.location.hostname}:3000/api/recibos`;
    const urlDescarga = `http://${window.location.hostname}:3000/api/recibos/${recibo.numero}/pdf`;
    
    // Primero guardar el recibo en el servidor
    this.http.post(apiUrlRecibos, recibo).subscribe({
      next: () => {
        // Luego descargar el PDF
        this.http.get(urlDescarga, { responseType: 'blob' }).subscribe({
          next: (blob) => {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `recibo-${recibo.numero}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
          },
          error: (err) => {
            console.error('Error descargando PDF:', err);
            alert('Error al descargar el recibo. Intenta nuevamente.');
          }
        });
      },
      error: (err) => {
        console.error('Error guardando recibo:', err);
        alert('Error al guardar el recibo. Intenta nuevamente.');
      }
    });
  }
}

