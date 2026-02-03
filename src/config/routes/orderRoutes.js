
/*Responsabilità orderRoutes.js:

 1. ricevere la richiesta dal client
2. leggere l URL della richiesta dal client
3. leggere il controller
4. attribuire a ciascuna funzione il percorso al file da gestire
5. esportare il Router (che poi importandolo in App.js darà vita a models e controllers)
------ FEATURES AVANZATE ------ 
6. verificare eventuali middleware 
7. 
8. 
9.  */

//Importo express ed il router
const express = require("express");
const router = express.Router();

//Importo il controller
const orderController = require('../controllers/orderController');

/* ############-- ROTTE GET --############### */

//1. Ottengo l'ordine di un Utente con utendeId
router.get("/user", orderController.getOrders); 

//2. Ottengo l'ordine con orderId
router.get("/:id", orderController.getOrderById);

//3.Ottengo l'array con tutti gli ordini
router.get("/", orderController.getOrders);

/* ############-- ROTTE POST --############### */

//1. Aggiorno un ordine esistente
router.put("order/:id",orderController.updateOrder);

//2. Creo un ordine
router.post("/",orderController.createOrder);

/* ############-- ROTTE DELETE --############### */

//1. Elimino un ordine esistente
router.delete("/:id", orderController.deleteOrder);


/* ############-- TO DO --############### */
//In contesto aziendale implementazione Middleware per gestione auth/admin


module.exports = router;