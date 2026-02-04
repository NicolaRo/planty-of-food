// utils/stockHelper.js

const Product = require('../models/Product');

/**
 * Aggiorna lo stock dei prodotti in base alla quantità ordinata.
 * @param {Array} products - Array di oggetti { product: productId, quantity: numero }
 * @param {Object} session - (opzionale) sessione mongoose per transazioni
 * @throws Error se la quantità richiesta supera lo stock disponibile
 */
const updateProductStock = async (products, session = null) => {
  for (let p of products) {
    // Recupero il prodotto dal DB
    const product = await Product.findById(p.product).session(session);

    //Prodotto inesistente -> 404
    if (!product) {
      const err = new Error (`Prodotto ${p.product} non trovato`)
        err.status = 404;
        err.type = "business";
        throw err;
    }

    //Stock insufficiente -> 409
    if (product.quantity < p.orderedQuantity) {
      const err = new Error(
        `Stock insufficiente per il prodotto ${product.name}`
      );
      err.status=409;
      err.type="business";
      throw err;
    }

    // Aggiorno la quantità
    await Product.findByIdAndUpdate(
      p.product,
      { $inc: { quantity: -p.orderedQuantity } },
      { session }
    );
  }
};

module.exports = { updateProductStock };