import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RecibosStorageService } from '../services/recibos-storage.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';
import { AuthService, Usuario } from '../services/auth.service';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './recibo.html',
  styleUrls: ['./recibo.css'],
})
export class ReciboComponent {
  @ViewChild('reciboContent', { static: false }) reciboContent!: ElementRef;

  recibo = {
    numero: '',
    oficina: '',
    fecha: '',
    remitente: {
      nombre: '',
      direccion: '',
      email: '',
      telefono: '',
      pais: ''
    },
    destinatario: {
      nombre: '',
      direccion: '',
      email: '',
      telefono: '',
      pais: ''
    },
    concepto: '',
    peso: null as number | null,
    costo: null as number | null,
    tipoServicio: '',
    tipoServicioSello: '',
    tipoPago: '',
    grupo: 'grupo1',
    precioSello: null as number | null,
    cantidadSellos: 1,
    departamento: '',
    municipio: '',
    costoBase: null as number | null,
    impuesto: 0,
    total: null as number | null
  };

  reciboGenerado: any = null;
  qrUrl: string = '';
  numeroRecibo = Math.floor(Math.random() * 1000000);
  errores: { [key: string]: string } = {};
  fechaHoy: string = ''; // NUEVO: Fecha de hoy únicamente permitidas
  busquedaServicio: string = ''; // NUEVO: Variable para búsqueda de servicios
  mostrarListaServicios: boolean = false; // NUEVO: Mostrar lista de servicios
  servicioSeleccionadoIndex: number = -1; // NUEVO: Índice del servicio seleccionado

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
    '44114 - Certificado Internacional',
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

  // NUEVO: Tipos de pago agrupados por categoría
  // NUEVO: Tipos de pago agrupados por categoría
  tiposPago = [
    { categoria: 'Efectivo', opciones: ['Efectivo'] },
    { categoria: 'Tarjetas', opciones: ['Tarjeta Crédito', 'Tarjeta Débito'] },
    { categoria: 'Transferencia', opciones: ['Transferencia Bancaria', 'Depósito Bancario'] },
    { categoria: 'Otros', opciones: ['Cheque', 'POS', 'SIAFI', 'Billetera Digital', 'Mixto'] }
  ];

  // Impuestos por tipo de pago en Honduras
  // ITF (Impuesto sobre Transacciones Financieras) = 3%
  // Comisión bancaria adicional = 2-3% (verificar con tu banco)
  impuestosPago = {
    'Efectivo': 0,           // Sin impuesto
    'Tarjeta Crédito': 0.03, // 3% ITF (cambiar a 0.05 si es 5% en tu banco)
    'Tarjeta Débito': 0.03,  // 2% (verificar con tu banco)
    'Transferencia Bancaria': 0,     // Sin impuesto directo
    'Depósito Bancario': 0,          // Sin impuesto directo
    'Cheque': 0,             // Sin impuesto
    'POS': 0,                // Sin impuesto
    'SIAFI': 0,              // Sin impuesto
    'Billetera Digital': 0.02, // 2% (según el servicio)
    'Mixto': 0.015           // 1.5% promedio
  };

  // NUEVO: Países para remitente y destinatario
  paisesRemitente = ['Honduras'];
  paisesDestinatario = [
    'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda', 'Arabia Saudita', 'Argelia',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Baréin', 'Bangladés', 'Barbados',
    'Bielorrusia', 'Bélgica', 'Belice', 'Benín', 'Bután', 'Bolivia', 'Bosnia y Herzegovina', 'Botsuana', 'Brasil',
    'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad',
    'Chile', 'China', 'Chipre', 'Colombia', 'Comoras', 'Corea del Norte', 'Corea del Sur', 'Costa de Marfil', 'Costa Rica',
    'Croacia', 'Cuba', 'Dinamarca', 'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos', 'Eritrea',
    'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia', 'Esuatini', 'Etiopía', 'Fiyi', 'Filipinas', 'Finlandia',
    'Francia', 'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada', 'Grecia', 'Guatemala', 'Guinea', 'Guinea-Bisáu',
    'Guinea Ecuatorial', 'Guyana', 'Haití', 'Honduras', 'Hungría', 'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda',
    'Islandia', 'Islas Marshall', 'Islas Salomón', 'Israel', 'Italia', 'Jamaica', 'Japón', 'Jordania', 'Kazajistán',
    'Kenia', 'Kirguistán', 'Kiribati', 'Kuwait', 'Laos', 'Letonia', 'Líbano', 'Lesoto', 'Liberia', 'Libia',
    'Liechtenstein', 'Lituania', 'Luxemburgo', 'Macedonia del Norte', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas',
    'Malí', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Micronesia', 'Moldova', 'Mónaco', 'Mongolia',
    'Montenegro', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda',
    'Omán', 'Países Bajos', 'Pakistán', 'Palaos', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia',
    'Portugal', 'Reino Unido', 'República Centroafricana', 'República Checa', 'República del Congo',
    'República Democrática del Congo', 'República Dominicana', 'Ruanda', 'Rumania', 'Rusia', 'Samoa',
    'San Cristóbal y Nieves', 'San Marino', 'San Vicente y las Granadinas', 'Santa Lucía', 'Santo Tomé y Príncipe',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka',
    'Suecia', 'Suiza', 'Surinam', 'Tailandia', 'Tayikistán', 'Tanzania', 'Timor Oriental', 'Togo', 'Tonga',
    'Trinidad y Tobago', 'Túnez', 'Turkmenistán', 'Turquía', 'Tuvalu', 'Ucrania', 'Uganda', 'Uruguay',
    'Uzbekistán', 'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabue'
  ];

  // NUEVO: Precios disponibles para Sellos Postales y Filatelicos
  preciosSello = [5, 10, 50, 100, 200];

  // NUEVO: Grupos geográficos
  grupos = [
    { id: 'grupo1', nombre: 'Centro América (GRUPO I)' },
    { id: 'grupo2', nombre: 'Norte América (GRUPO II)' },
    { id: 'grupo3', nombre: 'Sur América Y Caribe (GRUPO III)' },
    { id: 'grupo4', nombre: 'Europa (GRUPO IV)' },
    { id: 'grupo5', nombre: 'Resto del Mundo (GRUPO V)' },
  ];

  // URLs de la API
  apiUrlRecibos = `http://${window.location.hostname}:3000/api/recibos`;

  constructor(private recibosStorage: RecibosStorageService, private authService: AuthService, private http: HttpClient) {
    // NUEVO: Inicializar fecha a hoy únicamente
    const hoy = new Date();
    this.fechaHoy = hoy.toISOString().split('T')[0];
    this.recibo.fecha = this.fechaHoy; // Pre-llenar con la fecha de hoy
    this.recibo.remitente.pais = this.paisesRemitente[0];
    this.recibo.precioSello = null; // Inicializar precio del sello
  }

  ngOnInit() {
    this.asignarUsuario();
  }

  asignarUsuario() {
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.recibo.departamento = usuario.departamento;
      this.recibo.municipio = usuario.municipio;
    }
  }

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

  // NUEVA FUNCIÓN: Validar fecha en tiempo real
  validarFecha() {
    if (!this.recibo.fecha || this.recibo.fecha.trim() === '') {
      this.errores['fecha'] = 'La fecha es requerida';
      return;
    }

    // Comparar directamente con el string ISO para evitar problemas de zona horaria
    if (this.recibo.fecha !== this.fechaHoy) {
      const fechaHoyObj = new Date();
      const fechaFormato = fechaHoyObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      this.errores['fecha'] = `Solo se permite la fecha de hoy (${fechaFormato})`;
      this.recibo.fecha = this.fechaHoy; // Auto-corregir a la fecha de hoy
    } else {
      delete this.errores['fecha']; // Limpiar error si la fecha es válida
    }
  }

  // NUEVO: Getter para filtrar servicios por búsqueda
  get serviciosFiltrados() {
    if (!this.busquedaServicio.trim()) {
      return this.servicios;
    }
    const termino = this.busquedaServicio.toLowerCase().trim();
    return this.servicios.filter(s => s.toLowerCase().includes(termino));
  }

  // NUEVA FUNCIÓN: Manejar cambio de servicio
  onServicioChange() {
    const esCertificadoNacional = this.recibo.tipoServicio.includes('44113');
    const esCertificadoInternacional = this.recibo.tipoServicio.includes('44114');

    if ((esCertificadoNacional || esCertificadoInternacional) && !this.recibo.tipoServicioSello) {
      this.recibo.tipoServicioSello = '44105 - Sellos Postales';
    }

    const esSellos = this.recibo.tipoServicio.includes('44105') || this.recibo.tipoServicio.includes('45105') ||
      this.recibo.tipoServicioSello.includes('44105') || this.recibo.tipoServicioSello.includes('45105');

    if (!esSellos) {
      this.recibo.precioSello = null;
    }
    this.calcularCosto();
  }

  // NUEVO: Función para calcular costo automáticamente
  calcularCosto() {
    // NUEVO: Verificar si es Sellos Postales o Filatelicos
    const esSellos = this.recibo.tipoServicio.includes('44105') || this.recibo.tipoServicio.includes('45105') ||
      this.recibo.tipoServicioSello.includes('44105') || this.recibo.tipoServicioSello.includes('45105');

    const esCertificadoNacional = this.recibo.tipoServicio.includes('44113');
    const esCertificadoInternacional = this.recibo.tipoServicio.includes('44114');
    let cargoCertificado = 0;
    if (esCertificadoNacional) cargoCertificado += 10;
    if (esCertificadoInternacional) cargoCertificado += 50;

    if (esSellos) {
      // Para sellos: sumar precio del sello * cantidad + costo del peso según tabla geográfica
      let costoTotal = 0;
      const precioSelloSeleccionado = Number(this.recibo.precioSello) || 0;
      const cantidadSellos = Number(this.recibo.cantidadSellos) || 1;

      // Agregar precio del sello si está seleccionado
      if (precioSelloSeleccionado > 0) {
        costoTotal += precioSelloSeleccionado * cantidadSellos;
      }

      // Agregar costo del peso según la tabla geográfica
      if (this.recibo.peso && this.recibo.peso > 0) {
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

        if (rango) {
          const costo = precios[rango as keyof typeof precios];
          if (costo) {
            costoTotal += costo;
          }
        }
      }

      // Sumar cargo por certificado si aplica
      if (cargoCertificado > 0) {
        costoTotal += cargoCertificado;
      }

      this.recibo.costoBase = costoTotal > 0 ? costoTotal : null;
    } else {
      // Para otros servicios: usar tabla de precios por grupo geográfico
      let costoBase = 0;
      
      // Si hay peso, buscar el costo según la tabla
      if (this.recibo.peso && this.recibo.peso > 0) {
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

        if (rango) {
          const costo = precios[rango as keyof typeof precios];
          costoBase = costo || 0;
        }
      }

      // Sumar cargo por certificado y asignar costo final
      const costoFinal = costoBase + cargoCertificado;
      if (costoFinal > 0) {
        this.recibo.costoBase = costoFinal;
      } else {
        this.recibo.costoBase = null;
      }
    }

    // Calcular total con impuestos según tipo de pago
    this.calcularTotalConImpuesto();
  }

  // NUEVO: Calcular total con impuestos según tipo de pago
  calcularTotalConImpuesto() {
    if (!this.recibo.costoBase || this.recibo.costoBase <= 0) {
      this.recibo.impuesto = 0;
      this.recibo.total = null;
      this.recibo.costo = null;
      return;
    }

    // Obtener el porcentaje de impuesto según el tipo de pago
    const tipoPago = this.recibo.tipoPago || 'Efectivo';
    const porcentajeImpuesto = this.impuestosPago[tipoPago as keyof typeof this.impuestosPago] || 0;

    // Calcular impuesto
    const impuesto = this.recibo.costoBase * porcentajeImpuesto;
    this.recibo.impuesto = Math.round(impuesto * 100) / 100;

    // Calcular total
    this.recibo.total = this.recibo.costoBase + this.recibo.impuesto;
    this.recibo.costo = this.recibo.total; // Para compatibilidad con el resto del código
  }

  // NUEVO: Métodos para el autocomplete de servicios
  abrirListaServicios() {
    this.mostrarListaServicios = true;
    this.servicioSeleccionadoIndex = -1;
  }

  seleccionarServicio(servicio: string) {
    this.recibo.tipoServicio = servicio;
    this.recibo.tipoServicioSello = '';

    if (servicio.includes('44113') || servicio.includes('44114')) {
      this.recibo.tipoServicioSello = '44105 - Sellos Postales';
    }

    // Agregar cantidad para Apartado Postal
    if (servicio.includes('45211')) {
      this.recibo.cantidadSellos = 1;
    }

    this.busquedaServicio = '';
    this.mostrarListaServicios = false;
    this.servicioSeleccionadoIndex = -1;
    this.onServicioChange();
  }

  limpiarServicio() {
    this.recibo.tipoServicio = '';
    this.recibo.tipoServicioSello = '';
    this.recibo.precioSello = null;
    this.busquedaServicio = '';
    this.mostrarListaServicios = false;
    this.servicioSeleccionadoIndex = -1;
    this.calcularCosto();
  }

  // NUEVO: Cerrar lista al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(target)) {
      this.mostrarListaServicios = false;
    }
  }

  validarCampos(): boolean {
    this.errores = {};

    if (!this.recibo.oficina || this.recibo.oficina.trim() === '') {
      this.errores['oficina'] = 'La oficina es requerida';
    }
    if (!this.recibo.fecha || this.recibo.fecha.trim() === '') {
      this.errores['fecha'] = 'La fecha es requerida';
    } else {
      // NUEVA VALIDACIÓN: Verificar que la fecha sea exactamente hoy
      if (this.recibo.fecha !== this.fechaHoy) {
        const fechaHoyObj = new Date();
        const fechaFormato = fechaHoyObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        this.errores['fecha'] = `Solo se permite la fecha de hoy (${fechaFormato})`;
        this.recibo.fecha = this.fechaHoy; // Auto-corregir a la fecha de hoy
      } else {
        delete this.errores['fecha'];
      }
    }
    if (!this.recibo.remitente.direccion || this.recibo.remitente.direccion.trim() === '') {
      this.errores['remitenteDir'] = 'La dirección del remitente es requerida';
    }
    if (!this.recibo.remitente.nombre || this.recibo.remitente.nombre.trim() === '') {
      this.errores['remitenteNombre'] = 'El nombre del remitente es requerido';
    }
    if (!this.recibo.remitente.email || this.recibo.remitente.email.trim() === '') {
      this.errores['remitenteEmail'] = 'El email del remitente es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.recibo.remitente.email)) {
      this.errores['remitenteEmail'] = 'El email del remitente no es válido';
    }
    if (!this.recibo.remitente.telefono || this.recibo.remitente.telefono.trim() === '') {
      this.errores['remitentePhone'] = 'El teléfono del remitente es requerido';
    } else if (!/^[0-9+\-\s()]+$/.test(this.recibo.remitente.telefono)) {
      this.errores['remitentePhone'] = 'El teléfono del remitente no es válido';
    }
    if (!this.recibo.remitente.pais || this.recibo.remitente.pais.trim() === '') {
      this.errores['remitenteCountry'] = 'El país del remitente es requerido';
    }

    if (!this.recibo.destinatario.direccion || this.recibo.destinatario.direccion.trim() === '') {
      this.errores['destinatarioDir'] = 'La dirección del destinatario es requerida';
    }
    if (!this.recibo.destinatario.nombre || this.recibo.destinatario.nombre.trim() === '') {
      this.errores['destinatarioNombre'] = 'El nombre del destinatario es requerido';
    }
    if (!this.recibo.destinatario.email || this.recibo.destinatario.email.trim() === '') {
      this.errores['destinatarioEmail'] = 'El email del destinatario es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.recibo.destinatario.email)) {
      this.errores['destinatarioEmail'] = 'El email del destinatario no es válido';
    }
    if (!this.recibo.destinatario.telefono || this.recibo.destinatario.telefono.trim() === '') {
      this.errores['destinatarioPhone'] = 'El teléfono del destinatario es requerido';
    } else if (!/^[0-9+\-\s()]+$/.test(this.recibo.destinatario.telefono)) {
      this.errores['destinatarioPhone'] = 'El teléfono del destinatario no es válido';
    }
    if (!this.recibo.destinatario.pais || this.recibo.destinatario.pais.trim() === '') {
      this.errores['destinatarioCountry'] = 'El país del destinatario es requerido';
    }
    if (!this.recibo.tipoServicio || this.recibo.tipoServicio.trim() === '') {
      this.errores['tipoServicio'] = 'Seleccione un tipo de servicio';
    }
    // NUEVA VALIDACIÓN: Verificar precio de sello si es Sellos Postales o Filatelicos
    const esSellos = this.recibo.tipoServicio.includes('44105') || this.recibo.tipoServicio.includes('45105');
    if (esSellos && (!this.recibo.precioSello || this.recibo.precioSello <= 0)) {
      this.errores['precioSello'] = 'Seleccione un precio de sello';
    }
    if (!this.recibo.total || this.recibo.total <= 0) {
      this.errores['total'] = 'El total debe ser mayor a 0';
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

  private esHorarioPermitido(): boolean {
    const ahora = new Date();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();
    const inicio = 7 * 60 + 55; // 7:55 AM
    const fin = 17 * 60; // 5:00 PM
    return minutos >= inicio && minutos < fin;
  }

  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private esDiaCerrado(): boolean {
    const fechaHoy = this.obtenerFechaHoy();
    const diasCerrados = JSON.parse(localStorage.getItem('diasCerrados') || '[]');
    return diasCerrados.includes(fechaHoy);
  }

  private puedeRegistrarRecibo(): boolean {
    return this.esHorarioPermitido() && !this.esDiaCerrado();
  }

  generarRecibo() {
    if (!this.validarCampos()) {
      return;
    }

    if (!this.puedeRegistrarRecibo()) {
      if (this.esDiaCerrado()) {
        alert('El día ya fue cerrado. No se pueden registrar más datos hasta el siguiente día a las 7:55 AM.');
      } else {
        alert('Horario de registro cerrado. No se puede ingresar más información después de las 5:00 PM ni antes de las 7:55 AM.');
      }
      return;
    }

    this.reciboGenerado = {
      ...this.recibo,
      numero: this.numeroRecibo,
      fechaPago: this.recibo.fecha || new Date().toISOString().split('T')[0],
      total: this.recibo.total || 0,
    };

    // Guardar el recibo en sessionStorage para que pueda ser descargado desde el QR
    sessionStorage.setItem(`recibo_${this.numeroRecibo}`, JSON.stringify(this.reciboGenerado));

    // Guardar el recibo en el servidor para que se pueda descargar desde cualquier dispositivo
    this.http.post(this.apiUrlRecibos, this.reciboGenerado).subscribe({
      next: (response: any) => {
        console.log('Recibo guardado en servidor:', response);
      },
      error: (error) => {
        console.error('Error guardando recibo en servidor:', error);
      }
    });

    // Generar código QR localmente en Data URL
    this.generarQrCodeDataUrl(this.reciboGenerado).then((url) => {
      this.qrUrl = url;
    }).catch((error) => {
      console.error('Error generando QR:', error);
      this.qrUrl = '';
    });

    // NUEVO: Guardar el recibo en el almacenamiento
    this.recibosStorage.guardarRecibo(this.reciboGenerado);
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
    elemento.classList.add('pdf-ticket');

    // Ocultar los botones temporalmente
    const elementosNoPrint = elemento.querySelectorAll<HTMLElement>('.no-print');
    const displayOriginales: string[] = [];
    elementosNoPrint.forEach((boton) => {
      displayOriginales.push(boton.style.display || '');
      boton.style.display = 'none';
    });

    html2canvas(elemento, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      // Restaurar los botones
      elementosNoPrint.forEach((boton, index) => {
        boton.style.display = displayOriginales[index] || '';
      });
      elemento.classList.remove('pdf-ticket');

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
      elementosNoPrint.forEach((boton, index) => {
        boton.style.display = displayOriginales[index] || '';
      });
      elemento.classList.remove('pdf-ticket');
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

    elemento.classList.add('pdf-ticket');

    // Ocultar los botones temporalmente
    const elementosNoPrint = elemento.querySelectorAll<HTMLElement>('.no-print');
    const displayOriginales: string[] = [];
    elementosNoPrint.forEach((boton) => {
      displayOriginales.push(boton.style.display || '');
      boton.style.display = 'none';
    });

    html2canvas(elemento, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      // Restaurar los botones
      elementosNoPrint.forEach((boton, index) => {
        boton.style.display = displayOriginales[index] || '';
      });
      elemento.classList.remove('pdf-ticket');

      // Convertir canvas a imagen PNG
      const imagenURL = canvas.toDataURL('image/png');

      // Crear un mensaje de texto para acompañar
      const mensaje = `🧾 *RECIBO DE PAGO - CORREOS DE HONDURAS*\n\n*Recibo Nº:* ${this.reciboGenerado.numero}\n*Oficina:* ${this.reciboGenerado.oficina}\n*Fecha:* ${this.reciboGenerado.fechaPago}\n*Remitente:* Nombre: ${this.reciboGenerado.remitente?.nombre || 'No especificado'}; Dirección: ${this.reciboGenerado.remitente?.direccion || 'No especificada'}, Tel: ${this.reciboGenerado.remitente?.telefono || 'No especificado'}\n*Destinatario:* Nombre: ${this.reciboGenerado.destinatario?.nombre || 'No especificado'}; Dirección: ${this.reciboGenerado.destinatario?.direccion || 'No especificada'}, Tel: ${this.reciboGenerado.destinatario?.telefono || 'No especificado'}\n*Tipo de Servicio:* ${this.reciboGenerado.tipoServicio}\n*Tipo de Pago:* ${this.reciboGenerado.tipoPago || 'No especificado'}\n*Concepto:* ${this.reciboGenerado.concepto || 'No especificado'}\n*Peso:* ${this.reciboGenerado.peso || '0'} g\n*TOTAL A PAGAR:* L. ${(this.reciboGenerado.total || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n¡Gracias por usar los servicios de Correos de Honduras!`;

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
      elementosNoPrint.forEach((boton, index) => {
        boton.style.display = displayOriginales[index] || '';
      });
      elemento.classList.remove('pdf-ticket');
    });
  }

  private generarQrCodeDataUrl(recibo: any): Promise<string> {
    // Generar URL que apunta al servidor para descargar el PDF
    // Cuando se escanee el QR desde otro dispositivo, descargará el PDF directamente
    const urlDescarga = `http://${window.location.hostname}:3000/api/recibos/${recibo.numero}/pdf`;

    return QRCode.toDataURL(urlDescarga, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }

  nuevoRecibo() {
    this.recibo = {
      numero: '',
      oficina: '',
      fecha: this.fechaHoy,
      remitente: {
        nombre: '',
        direccion: '',
        email: '',
        telefono: '',
        pais: ''
      },
      destinatario: {
        nombre: '',
        direccion: '',
        email: '',
        telefono: '',
        pais: ''
      },
      concepto: '',
      peso: null,
      costoBase: null,
      impuesto: 0,
      total: null,
      costo: null,
      tipoServicio: '',
      tipoServicioSello: '',
      tipoPago: '',
      grupo: 'grupo1',
      precioSello: null,
      cantidadSellos: 1,
      departamento: '',
      municipio: ''
    };
    this.asignarUsuario();
    this.reciboGenerado = null;
    this.numeroRecibo = Math.floor(Math.random() * 1000000);
    this.errores = {};
  }

  // NUEVA FUNCIÓN: Limpiar formulario
  limpiarFormulario() {
    this.recibo = {
      numero: '',
      oficina: '',
      fecha: this.fechaHoy,
      remitente: {
        nombre: '',
        direccion: '',
        email: '',
        telefono: '',
        pais: ''
      },
      destinatario: {
        nombre: '',
        direccion: '',
        email: '',
        telefono: '',
        pais: ''
      },
      concepto: '',
      peso: null,
      costoBase: null,
      impuesto: 0,
      total: null,
      costo: null,
      tipoServicio: '',
      tipoServicioSello: '',
      tipoPago: '',
      grupo: 'grupo1',
      precioSello: null,
      cantidadSellos: 1,
      departamento: '',
      municipio: ''
    };
    this.asignarUsuario();
    this.reciboGenerado = null;
    this.numeroRecibo = Math.floor(Math.random() * 1000000);
    this.errores = {};
  }
}