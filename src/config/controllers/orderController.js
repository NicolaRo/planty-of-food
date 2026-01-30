const Order = require("../models/Order"); // Otteno l'oggetto 'Order' dal modello mongoose.
const Product = require("../models/Product"); //Ottengo l'oggetto 'Product'. 
const User = require("../models/User"); //Ottengo l'oggetto 'User'.

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
        
        //1.2 Verifica Utente
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message: "Utente non trovato"});
        
        //1.3 Controlla prodotti e disponibilità
        for (let p of products) {
            const product = await Product.findById(p.product);

            if(!product) return res.status (404).json({
                message: `${p.product} non trovato`
            });
            if (product.quantity < p.quantity)
                return res.status (400).json({
                    message: `L'articolo ${product.name} è attualmente esaurito`
                });
        }

        //--- GESTISCO LA TRANSACTION ---
        //Mi consente anche di definire che la "CREATE ORDINE" avviene all'interno della {session}
        session.startTransaction();

        //1.4 Aggiorna la quantità dei prodotti
        for (let p of products) {
            await Product.findByIdAndUpdate(
                p.product,
                { $inc: {quantity: -p.quantity}},
                {session}
            );
        }

        //1.5 Crea ordine
        //NOTE lo inserisco all'interno di un Array [] perchè è come vengono restituiti i dati da MongoDB
        
        const order = await Order.create ([
                {
                    user: user._id,
                    products,
                    status: "pending",
                }
            ], {session} 
        );

        //1.6 Commit della transazione (così n° prodotti e ordini vengono aggiornati insieme o non aggiornati del tutto per manetere coerenza con database)
        await session.commitTransaction();
        session.endSession();

        // BONUS: Verifico il contenuto dell'ordine appena creato -> dovrò implementare withTransaction in produzione
        //per verificare che l'update dei prodotti sia coerente con la creazione dell'ordine.
        console.log("Ordine creato:", order[0]._id);
                

        return res.status(201).json(order[0]);

    } catch (error) {
        //Se l'errore sorge prima dello "startTransaction" abortisco l'operazione
        if (session.inTransaction()){
        //NOTE: nel caso di errore "abort.transaction" e "endSession" consentono di NON caricare i dati su di un unico database o entrambi o niente.
        await session.abortTransaction();
        }
        //..e chiudo la sessione così nulla viene committato e i files restano con l'ultimo aggiornamento "SICURO" postato nel DB.
        session.endSession();
        
        //NOTE: lo verifico con un console.log per debugging
        console.error("Transaction abortita", error.message);
        
        return res.status(500).json({message: "Errore durante la creazione dell'ordine, riprova tra poco"}); 
    }
};

/* ############-- READ UN ORDINE --############### */

    //2.1 Ottenere TUTTI gli ordini
    const getOrders = async (req, res) => {
        try {
            const orders = await Order.find().populate("user").populate("products.product");
            return res.json(orders);
        } catch (error) {
            return res.status(500).json ({message: error.message});
        }
    };

    //2.2 Ottenere gli ordini dell'UTENTE LOGGATO
    const getUserOrders = async (req, res) => {
        try{
            const userId = req.params.userId;
            const orders = await Order.find({user: userId}).populate("products.product");
            return res.json(orders);
        } catch (error) {
            return res.status(500).json ({message: error.message});
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
        const updateOrderStatus = async (req, res) => {
            try {
                const {status} = req.body;
                const allowedStatuses = ["in lavorazione", "pagato", "consegnato"];
                if (!allowedStatuses.includes(status)) 
                    return res.status(400).json ({message: "Stato ordine non valido"});
                
                const order = await Order.findByIdAndUpdate(
                    req.params.id, 
                    {status}, 
                    {new: true}
                );
                if (!order)
                    return res.status(404).json({message: "Ordine non trovato"});
                return res.json(order);
            } catch (error) {
                return res.status(500).json({message: error.message});
            } 
        };
                

/* ############-- DELETE UN ORDINE --############### */

        const deleteOrder = async (req, res) => {
            try {
                const order = await Order.findByIdAndDelete(req.params.id);
                if(!order) 
                    return res.status(404).json({message: "Ordine non trovato"});
                return res.json({message: "Ordine cancellato correttamente"});
            } catch (error) {
                return res.status(500).json ({message: error.message});
            }
        };

    module.exports = { //--> esporto le funzioni
        createOrder,
        getOrders,
        getOrderById,
        updateOrderStatus,
        deleteOrder
    };