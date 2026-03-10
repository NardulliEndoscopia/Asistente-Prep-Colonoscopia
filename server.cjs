/**
 * server.cjs
 * Servidor Express para producción en Google Cloud Run.
 * Sirve los archivos estáticos compilados por Vite.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// ── Directorio donde Vite deja los archivos compilados ─────────────────────
const DIST_DIR = path.join(__dirname, 'dist');

// Verificar que la carpeta dist existe
if (!fs.existsSync(DIST_DIR)) {
  console.error('ERROR: La carpeta "dist" no existe. Ejecuta "npm run build" primero.');
  process.exit(1);
}

// ── Servir archivos estáticos (JS, CSS, imágenes, etc.) ───────────────────
app.use(express.static(DIST_DIR, {
  maxAge: '1y',          // Cache largo para assets con hash
  etag: true,
  lastModified: true,
}));

// ── Ruta de salud para Google Cloud ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Todas las rutas devuelven index.html (Single Page Application) ────────
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// ── Iniciar servidor ──────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor arrancado en http://0.0.0.0:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'production'}`);
});
