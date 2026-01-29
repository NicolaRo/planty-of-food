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
       try{
        const {userId, products} = req.body;
        
        //1.2 Verifica Utente
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message: "Utente non trovato"});
        
        //1.3 Controlla prodotti e disponibilità
        for (let p of products) {
            const product = await Product.findById(p.productId);
            if(!product) return res.status (404).json({message: `${p.productId} non trovato` });
            if (product.quantity < p.quantity)
                return res.status (400).json({message: `L'articolo ${product.name} è attualmente esaurito`});
        }

        //1.4 Aggiorna la quantità dei prodotti
        for (let p of products) {
            await Product.findByIdAndUpdate(p.productId,{
                $inc: {quantity: -p.quantity}
            });
        }


        //1.5 Crea ordine
        const order = await Order.create ({
            user: user._id,
            products,
            total,
            status: "pending",
            createdAt: new Date()
        });

        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({message: error.message}); 
    }
};

/* ############-- READ UN ORDINE --############### */

    //2.1 Ottenere TUTTI gli ordini
    const getOrders = async (req, res) => {
        try {
            const orders = await Order.find().populate("user").populate("products.productId");
            return res.json(orders);
        } catch (error) {
            return res.status(500).json ({message: error.message});
        }
    };

    //2.2 Ottenere gli ordini dell'UTENTE LOGGATO
    const getUserOrders = async (req, res) => {
        try{
            const userId = req.params.userId;
            const orders = await Order.find({user: userId}).populate("products.productId");
            return res.json(orders);
        } catch (error) {
            return res.status(500).json ({message: error.message});
        }
    };

    //2.3 Ottenere singolo ordine per Id
    const getOrderById = async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate("user").populate("products.productsId");
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
                
                const order = await Order.findByIdAndUpdate(req.params.id, {status}, {new: true});
                if (!order)
                    return res.status(404).json({message: "Ordine non trovato"});
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