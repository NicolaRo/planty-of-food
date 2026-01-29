/* const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  description: { type: String },
  category: { type: String }
}, { timestamps: true }); // crea createdAt e updatedAt automaticamente

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

 */

//importo mongoose, definisce i parametri del DB
const mongoose = require("mongoose");

//Definisco i parametri del DB "Product"
const productSchema = new mongoose.Schema({

  //name: sarà di tipo stringa, valore obblifatorio e trim elimina spazi prima e dopo il primo e l'ultimo carattere
  name: { 
    type: String, 
    required: [true, 'Il nome del prodotto è obbligatorio'], //Se non fornisco il nome compare un messaggio
    trim: true,
    minlength: [2, 'Il nome deve contenere almeno 2 caratteri']
  },
  type: {
    type: Number,
    enum: ["vegetable", "fruit", "drink", "other"],
    required: [true, "Definire il tipo di prodotto"]
  },
  availability: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, "La quantità non può essere negativa"]
  },
  /* ,
  //predispongo all'aggiunta del valore prezzo per i prodotti
  price: {
    type: Number,
    required: [true, 'il prezzo del prodotto è obbligatorio'],
    min: [0, 'Il prezzo non può essere negativo']
  } */
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;