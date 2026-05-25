const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Cambia si tienes contraseña en MySQL
  database: 'recibos_correos'
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('✓ Conectado a MySQL');
});

module.exports = connection;
