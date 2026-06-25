require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'api-data.json');

// Almacén en memoria para recibos (se limpia cada vez que reinicia el servidor)
const recibosGuardados = {};

// Configuración de MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recibos_correos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Inicializar base de datos
async function inicializarBD() {
  try {
    const connection = await pool.getConnection();
    
    // Crear tabla usuarios si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) UNIQUE NOT NULL,
        direccion VARCHAR(255),
        telefono VARCHAR(20),
        rol VARCHAR(50) NOT NULL,
        departamento VARCHAR(100),
        municipio VARCHAR(100),
        contrasena VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    console.log('✓ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
}

// Inicializar BD al arrancar
inicializarBD();

function loadData() {
  if (!fs.existsSync(dataFile)) {
    const initialData = {
      cierres: [],
      diasCerrados: []
    };
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error leyendo api-data.json:', error);
    return { cierres: [], diasCerrados: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API de cierres disponible',
    endpoints: ['/api/health', '/api/cierres', '/api/dias-cerrados']
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/cierres', (req, res) => {
  const data = loadData();
  res.json(data.cierres);
});

app.post('/api/cierres', (req, res) => {
  const cierre = req.body;
  if (!cierre || !cierre.fecha || !cierre.horaCierre) {
    return res.status(400).json({ error: 'Cierre inválido. Se requiere fecha y horaCierre.' });
  }

  const data = loadData();
  data.cierres.push(cierre);
  saveData(data);
  res.status(201).json(cierre);
});

app.get('/api/dias-cerrados', (req, res) => {
  const data = loadData();
  res.json(data.diasCerrados);
});

app.post('/api/dias-cerrados', (req, res) => {
  const { fecha } = req.body;
  if (!fecha) {
    return res.status(400).json({ error: 'Se requiere fecha para cerrar el día.' });
  }

  const data = loadData();
  if (!data.diasCerrados.includes(fecha)) {
    data.diasCerrados.push(fecha);
    saveData(data);
  }

  res.status(201).json({ fecha });
});

// Registro - crear nueva cuenta
app.post('/api/auth/registro', async (req, res) => {
  const { nombre, correo, direccion, telefono, rol, departamento, municipio, contrasena } = req.body;

  // Validar datos
  if (!nombre || !correo || !contrasena || !rol || !departamento || !municipio) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const connection = await pool.getConnection();

    // Verificar si el usuario ya existe
    const [existentes] = await connection.execute(
      'SELECT correo FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existentes.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, correo, direccion, telefono, rol, departamento, municipio, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, correo, direccion || '', telefono || '', rol, departamento, municipio, hashedPassword]
    );

    connection.release();

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: result.insertId,
        nombre,
        correo,
        rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el registro: ' + error.message });
  }
});

// Login - verificar correo y contraseña
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  try {
    const connection = await pool.getConnection();

    // Buscar usuario
    const [usuarios] = await connection.execute(
      'SELECT id, nombre, correo, rol, departamento, municipio, contrasena, createdAt FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarios.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    connection.release();

    // Retornar datos del usuario (sin contraseña)
    res.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        departamento: usuario.departamento,
        municipio: usuario.municipio,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login: ' + error.message });
  }
});

// Obtener todos los usuarios (sin contraseñas)
app.get('/api/auth/usuarios', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [usuarios] = await connection.execute(
      'SELECT id, nombre, correo, rol, rolAnterior, departamento, municipio, createdAt FROM usuarios'
    );

    connection.release();

    res.json(usuarios);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error: ' + error.message });
  }
});

app.patch('/api/auth/usuarios/:id/rol', async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  console.log('PATCH /api/auth/usuarios/'+id+'/rol', rol);
  const rolesValidos = ['Administrador', 'Supervisor', 'Ventanilla'];

  if (!rol || !rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    const connection = await pool.getConnection();
    const [usuarioActual] = await connection.execute(
      'SELECT rol FROM usuarios WHERE id = ?',
      [id]
    );

    if (!usuarioActual || usuarioActual.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const rolPrevio = usuarioActual[0].rol;
    const [result] = await connection.execute(
      'UPDATE usuarios SET rol = ?, rolAnterior = ? WHERE id = ?',
      [rol, rolPrevio, id]
    );
    connection.release();

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ error: 'Error: ' + error.message });
  }
});

app.delete('/api/auth/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  console.log('DELETE /api/auth/usuarios/'+id);

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    connection.release();

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error: ' + error.message });
  }
});

// ==================== ENDPOINTS PARA RECIBOS ====================
// Guardar recibo en memoria
app.post('/api/recibos', (req, res) => {
  const recibo = req.body;
  
  if (!recibo || !recibo.numero) {
    return res.status(400).json({ error: 'Recibo inválido' });
  }

  // Guardar en memoria
  recibosGuardados[recibo.numero] = recibo;
  
  res.json({ 
    message: 'Recibo guardado',
    urlDescarga: `http://localhost:${port}/api/recibos/${recibo.numero}/pdf`
  });
});

// Descargar recibo en PDF
app.get('/api/recibos/:numero/pdf', (req, res) => {
  const { numero } = req.params;
  
  const recibo = recibosGuardados[numero];
  if (!recibo) {
    return res.status(404).json({ error: 'Recibo no encontrado' });
  }

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  
  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Recibo_${numero}.pdf"`);
  
  // Pipe al response
  doc.pipe(res);
  
  // ===== HEADER AZUL =====
  doc.rect(0, 0, doc.page.width, 80).fill('#1e5a96');
  
  // Texto en header blanco
  doc.fillColor('white');
  doc.fontSize(20).font('Helvetica-Bold').text('CORREOS DE HONDURAS', 40, 20);
  doc.fontSize(10).font('Helvetica').text('RECIBO DE PAGO - INGRESOS CORRIENTES "TESORERÍA"', 40, 45);
  
  // Volver a color negro
  doc.fillColor('black');
  doc.y = 90;
  
  // ===== NÚMERO DE RECIBO =====
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e5a96').text('RECIBO Nº');
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e5a96').text(recibo.numero);
  
  doc.y = 120;
  
  // ===== INFORMACIÓN EN DOS COLUMNAS =====
  const col1X = 40;
  const col2X = 310;
  const lineHeight = 20;
  let currentY = doc.y;
  
  // Fila 1: Oficina/Agencia y Fecha
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e5a96').text('Oficina/Agencia:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').fillColor('black').text(recibo.oficina || 'INT', col1X + 100, currentY);
  
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e5a96').text('Fecha de Pago:', col2X, currentY);
  doc.fontSize(10).font('Helvetica').fillColor('black').text(recibo.fechaPago || '', col2X + 100, currentY);
  
  // Fila 2: Tipo de Servicio
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e5a96').text('Tipo de Servicio:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').fillColor('black').text(recibo.tipoServicio || 'No especificado', col1X + 100, currentY);
  
  // Fila 3: Tipo de Pago
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e5a96').text('Tipo de Pago:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').fillColor('black').text(recibo.tipoPago || 'No especificado', col1X + 100, currentY);
  
  // Fila 4: Peso
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e5a96').text('Peso:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').fillColor('black').text((recibo.peso || '0') + ' g', col1X + 100, currentY);
  
  doc.y = currentY + 35;
  
  // ===== REMITENTE =====
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e5a96').text('REMITENTE');
  doc.moveTo(40, doc.y + 2).lineTo(560, doc.y + 2).stroke('#cccccc');
  
  currentY = doc.y + 10;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('black').text('Nombre:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').text(recibo.remitente?.nombre || 'No especificado', col1X + 100, currentY);
  
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').text('Dirección:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').text(recibo.remitente?.direccion || 'No especificada', col1X + 100, currentY);
  
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').text('País:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').text(recibo.remitente?.pais || 'No especificado', col1X + 100, currentY);
  
  doc.y = currentY + 25;
  
  // ===== DESTINATARIO =====
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e5a96').text('DESTINATARIO');
  doc.moveTo(40, doc.y + 2).lineTo(560, doc.y + 2).stroke('#cccccc');
  
  currentY = doc.y + 10;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('black').text('Nombre:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').text(recibo.destinatario?.nombre || 'No especificado', col1X + 100, currentY);
  
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').text('Dirección:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').text(recibo.destinatario?.direccion || 'No especificada', col1X + 100, currentY);
  
  currentY += lineHeight;
  doc.fontSize(9).font('Helvetica-Bold').text('País:', col1X, currentY);
  doc.fontSize(10).font('Helvetica').text(recibo.destinatario?.pais || 'No especificado', col1X + 100, currentY);
  
  doc.y = currentY + 35;
  
  // ===== TOTAL A PAGAR =====
  doc.rect(40, doc.y, 520, 70).fill('#f5f5f5');
  
  const totalY = doc.y + 10;
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e5a96').text('TOTAL A PAGAR', 60, totalY);
  
  const total = (recibo.total || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e5a96').text(`L. ${total}`, 60, totalY + 25);
  
  doc.y += 90;
  
  // ===== FOOTER =====
  doc.fontSize(8).font('Helvetica').fillColor('#666666').text('Documento generado automáticamente por el Sistema de Recibos', { align: 'center' });
  doc.fontSize(8).text('Correos de Honduras - Todos los derechos reservados', { align: 'center' });
  
  doc.end();
});

app.listen(port, () => {
  console.log(`✓ API server running at http://localhost:${port}/api`);
  console.log(`✓ Database: recibos_correos`);
});
