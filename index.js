// Carica le variabili d'ambiente dal file .env
require('dotenv').config();

// Importa l'applicazione Express
const app = require('./src/app');

// Importa la funzione di connessione al database
const connectDB = require('./src/config/database');

// Legge la porta dalle variabili d'ambiente (default 3000)
const PORT = process.env.PORT || 3000;

// Funzione per avviare il server
const startServer = async () => {
  try {
    // Prima: Connetti al database
    await connectDB();
    console.log('✅ Database connesso con successo');

    // Poi: Avvia il server Express
    app.listen(PORT, () => {
      console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
      console.log(`📚 Ambiente: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Errore durante l\'avvio del server:', error.message);
    process.exit(1); // Termina il processo se qualcosa va storto
  }
};

// Avvia!
startServer();