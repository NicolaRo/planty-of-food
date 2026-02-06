//Mongoose definisce le regole di inserimento dati, lo schema dati come dev'essere costruito.
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      orderedQuantity: { type: Number, required: true },
      /* price: { type: Number, required: true } */
    }
  ],
  total: { type: Number },
  status: { type: String, default: "pending" },
}, {timestamps: true});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;