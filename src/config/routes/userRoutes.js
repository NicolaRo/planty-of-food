/* Responsabilità del file
1. Indirizzo alla lettura di un Utente specifico
2. Indirizzo alla lettura degli Utenti
3. Indirizzare all'aggiunta di un nuovo Utente 
4. Indirizzare alla modifica dell'Utente
5. Indirizzare alla cancellazione di un Utente */

//Importo express ed il router
const express =require("express");
const router = express.Router();

//Importo il controller

const userController = require('../controllers/userController');

/* ############-- ROTTE GET --############### */

// 1. Indirizzo alla lettura di un Utente specifico
router.get("/:id", userController.getUserById);

// 2. Indirizzo alla lettura degli Utenti
router.get("/", userController.getUsers);

/* ############-- ROTTE POST --############### */

// 3. Indirizzo all'aggiunta di un nuovo Utente 
router.post("/", userController.createUser);

//4. Indirizzo alla modifica dell'Utente
router.put("/:id", userController.updateUser);

/* ############-- ROTTE DELETE --############### */

// 5. Indirizzo alla cancellazione di un Utente
router.delete("/:id", userController.deleteUser);