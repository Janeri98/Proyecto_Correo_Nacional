const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'api-data.json');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}/api`);
});
