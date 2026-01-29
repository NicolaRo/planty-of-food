const mongoose = require('mongoose');

/**
 * Connette l'applicazione a MongoDB usando Mongoose
 * @returns {Promise} Promise che si risolve quando la connessione è stabilita
 */
const connectDB = async () => {
  try {
    // Opzioni di connessione consigliate
    const options = {
      // Usa il nuovo parser dell'URL di MongoDB
      // (evita warning di deprecazione)
    };

    // Tenta la connessione
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`📦 MongoDB connesso: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);

  } catch (error) {
    console.error('❌ Errore connessione MongoDB:', error.message);
    
    // In caso di errore, termina il processo
    // (meglio crashare subito che continuare senza DB)
    process.exit(1);
  }
};

// Gestione chiusura connessione quando l'app termina
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Connessione MongoDB chiusa');
  process.exit(0);
});

module.exports = connectDB;