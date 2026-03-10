const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const DIST = path.join(__dirname, 'dist');

// Archivos estáticos (JS, CSS, imágenes)
app.use(express.static(DIST, {
  maxAge: '1y',
  etag: true,
}));

// Health check para Google Cloud
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// SPA: todas las rutas sirven index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor en puerto ${PORT}`);
});
