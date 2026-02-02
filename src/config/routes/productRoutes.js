/*Responsabilità di productRoutes.js 

1. Ricevere la richiesta dal client
2. Ricevere dati relativi ad un prodotto
3. Indirizzare al productController per la creazione di un nuovo prodotto
4. Indirizzare al productController per la modifica di un prodotto
5. Indirizzare al productController per la cancellazione di un prodotto (prevista anche la gestione dello stock residuo)
*/

//Importo express ed il router
const express = require("express");
const router = express.Router();

//Importo il controller
const productController = require ('../controllers/productController');
const { findByIdAndDelete } = require("../models/Product");

/* ############-- ROTTE GET --############### */

// 1. Ottengo l'ordine con id specifico
router.get("/:id", productController.getProductById);

// 2. Ottengo tutti i prodotti
router.get("/",productController.getProducts);

/* ############-- ROTTE POST --############### */

// 1. Creo un nuovo prodotto
router.post("/", productController.createProduct);

// 2. // Aggiorno un prodotto esistente
router.put("/:id", productController.updateProduct);

/* ############-- ROTTE DELETE --############### */

// 1. Elimino un prodotto esistente
router.delete("/:id", productController.deleteProduct);