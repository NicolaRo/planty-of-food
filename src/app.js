const express = require('express');

// Crea l'applicazione Express
const app = express();

// ========== MIDDLEWARE ==========

// 1. Parse JSON nel body delle richieste
// (senza questo, req.body sarebbe undefined)
app.use(express.json());

/* // 2. Parse URL-encoded data (form) --> questo parsa i form
app.use(express.urlencoded({ extended: true })); */

// 3. Logging semplice per debug
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========

// Route di test (per verificare che il server funzioni)
app.get('/', (req, res) => {
  res.json({
    message: '🌱 Benvenuto su Planty of Food API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      users: '/api/users',
      orders: '/api/orders'
    }
  });
});

// Health check (utile per verificare se l'API è online)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// TODO: Qui aggiungeremo le routes per products, users, orders

// ========== ERROR HANDLING ==========

// 404 - Route non trovata
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trovata',
    path: req.path
  });
});

// Error handler generico
app.use((err, req, res, next) => {
  console.error('❌ Errore:', err.message);
  
  res.status(err.status || 500).json({
    error: err.message || 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Esporta l'app (verrà usata in index.js)
module.exports = app;