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

    if (!product) {
      throw new Error(`Prodotto ${p.product} non trovato`);
    }

    if (product.quantity < orderedQuantity) {
      throw new Error(`L'articolo ${product.name} è esaurito`);
    }

    // Aggiorno la quantità
    await Product.findByIdAndUpdate(
      p.product,
      { $inc: { quantity: -orderedQuantity } },
      { session }
    );
  }
};

module.exports = { updateProductStock };