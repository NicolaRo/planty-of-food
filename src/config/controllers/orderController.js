const mongoose = require("mongoose"); //Ottengo mongoose per la gestione del database.
const Order = require("../models/Order"); // Otteno l'oggetto 'Order' dal modello mongoose.
const Product = require("../models/Product"); //Ottengo l'oggetto 'Product'. 
const User = require("../models/User"); //Ottengo l'oggetto 'User'.

const {updateProductStock}= require('../utils/stockHelper.js'); //Importo la funzione helper per aggiornare lo stock sia in GET che POST
//orderController.js deve -- Create - Read - Update - Delete -->

//CREATE UN ORDINE
    // Validare utente (User.findById)
    // Validare il prodotto e disponibilità (Product.findById, e quantità ≥ richiesta)
    // Aggiornare quantità dei prodotti
    // Salvare ordine (Order.create)
    // Collegare ordine all'utente (e ad un gruppo se presente)

//READ GLI ORDINI
    // Tutti (getOrders)
    // Solo ordini utente loggato (getUserOrders)
    // Singolo ordine per ID (getOrdersById)

//UPDATE GLI ORDINI
    // Cambiare stato (updateOrderStatus: pending -> paid -> delivered)
    // Aggiornare quantità prodotti

//DELETE GLI ORDINI
    // Opzionale (deleteOrder)
    
/* ############-- CREARE UN ORDINE --############### */
       //1.1 Creazione del nuovo ordine: 
       const createOrder = async (req, res) => {
        
        //1.1.1 Avvio una sessione che conterrà la creazione nuovi prodotti e nuovi ordini e le gestira
        //assieme per farle andare a buon fine (o meno) entrambe e non avere discrepanze di dati nel database.
        const session = await mongoose.startSession();

       try{
        const {userId, products} = req.body;
        
        //1.1.2 Validazione base input
        //Ovvero verifichiamo le condizioni per cui possiamo accettare l'inserimento di un ordine (come devono essere costituiti i dati per essere registrati nel database)
        if (!userId || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({message: "Dati ordine mancanti o non validi"});
        }

        for (let p of products) {
            if (!p.product || !p.quantity || p.quantity <= 0) {
                return res.status(400).json({ message: "Ogni prodotto deve avere id e quantità positiva"});
            }
        }

        //1.2.1 Verifica Utente
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message: "Utente non trovato"});

        //--- GESTISCO LA TRANSACTION ---
        //Mi consente anche di definire che la "CREATE ORDINE" avviene all'interno della {session}
        await session.withTransaction(async ()=> {
            //1.4 Aggiorna la quantità dei prodotti
        await updateProductStock(products, session);
        
        // 1.5 Creo l'ordine
        const [order] = await Order.create(
            [
                {
                    user: user._id,
                    products,
                    status: "pending",
                }
            ], 
            {session}
        );
        // BONUS: Verifico il contenuto dell'ordine appena creato implementato con withTransaction pronto per la produzione
        //per verificare che l'update dei prodotti sia coerente con la creazione dell'ordine.
        console.log("Ordine creato:", order._id);
        res.status(201).json(order);
    });
    } catch (error) {
        console.error("Errore cerazione ordine:", error.message);
        res.status(500).json({message:"Errore durante la creazione dell'ordine, riprova"});
    } finally {
        //Chiudo la sessione con finally per una migliore gestione del codice.
        session.endSession();
    } 
};

/* ############-- READ UN ORDINE --############### */

    //2.1 Ottenere TUTTI gli ordini
    
    const getOrders = async (req, res) => {
    try {
        // 2.2.1 Leggo i filtri dalla query string
        const { date, product, userId } = req.query;

        // 2.2.2 Creo filtro dinamico
        const filter = {};

        // 2.2.3 Filtro per data di inserimento
        if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: start, $lte: end };

    //2.3 Ottenere gli ordini dell'UTENTE LOGGATO
    } if (userId) {
        filter.user = userId;
    }

    // 2.4 Filtro per prodotto contenuto nell’ordine
    if (product) {
      filter["products.product"] = product;
    }

    // 2.5 Query finale
    const orders = await Order.find(filter)
      .populate("user")
      .populate("products.product");

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

    //2.3 Ottenere singolo ordine per Id
    const getOrderById = async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate("user").populate("products.product");
            if (!order) return res.status(404).json({message: "Ordine non trovato"});
            return res.json(order);
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

/* ############-- UPDATE UN ORDINE --############### */
const updateOrder = async (req, res) => {
    
    //Avvio la sessione con mongoose 
    const session = await mongoose.startSession();
    
    try {
        const orderId = req.params.id
        const { products: newProducts, status} = req.body;

        const order = await Order.findById(orderId);

        if (!order)
            return res.status(404).json({message: "Ordine non trovato"});

        await session.withTransaction(async() => {
            //Aggiorna stock dei nuovi prodotti se prensenti
            //Se presente un new products ed è maggiore di "0"
            if(newProducts && newProducts.length>0) {
                //Attendi che venga "eseguite la updateProductsStock" sui newProducts all'interno della "session"
                await updateProductStock(newProducts, session);
                //A quel punto pusha il "newProducts" sul database.
                order.products.push(...newProducts);
            }
            //Aggiorna lo status ordine se presente
            if(status) {
                const allowedStatuses = ["pending", "paid", "delivered"];
                if(!allowedStatuses.includes(status)) {
                    throw new Error ("Stato ordine non valido");
                }
                order.status = status;
            } 
            await order.save ({session});
            
        }); 
        res.status(200).json(order);

    } catch (error) {
        console.error("Errore aggiornamento ordine", error.message);
        res.status(500).json ({message: error.message});
    } finally {
        session.endSession();
    }
};

/* ############-- DELETE UN ORDINE --############### */

        const deleteOrder = async (req, res) => {
            const session = await mongoose.startSession();

            try {
                const orderId = req.params.id;

                await session.withTransaction(async() => {
                    const order = await Order.findById(orderId).session(session);
                    if (!order) throw new Error ("Ordine non trovato");
            
                    //Ripristino stock prodotti
                    for (let p of order.products) {
                        await Product.findByIdAndUpdate (
                            p.product,
                            {$inc: {quantity : p.quantity}},
                            {session}
                        );
                    }
                    await Order.findByIdAndDelete(orderId).session(session);
                });
                res.json({message: "Ordine cancellato e stock ripristinato correttamente"});

            } catch (error) {
                console.error("Errore cancellazione ordine:", error.message);
                return res.status(500).json ({message: error.message});
            } finally {
                session.endSession();
            };
        }
            

    module.exports = { //--> esporto le funzioni
        createOrder,
        getOrders,
        getOrderById,
        updateOrder,
        deleteOrder
    };