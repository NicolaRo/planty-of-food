const Order = require("../models/Order"); // Otteno l'oggetto 'Order' dal modello mongoose.
const Product = require("../models/Product"); //Ottengo l'oggetto 'Product'. 
const User = require("../models/User"); //Ottengo l'oggetto 'User'.

quali responsabilità ha --> mettere insieme il prodotto ordinato (con i riferimenti della data e l'ora) con l'utente che lo ha creato
    
    OrderController è responsabile di:
        creare un ordine
        validare i dati
        controllare disponibilità prodotti
        calcolare il totale
        collegare l’ordine a:
        utente
        gruppo (se esiste)
        aggiornare quantità prodotto
        cambiare stato ordine
        restituire risposte HTTP


    📋 FUNZIONI CHE UN OrderController DEVE AVERE
   
    🔹 CRUD base
    C= Create R= Read U= Update D= Delete

    const createOrder = async (req, res) => {
        try {
        1. controllare che l'utente esista
        2. controllare prodotti e disponibilià
        3. calcolare il totale --> questo lo possiamo evitare
        4. creare l'ordine
        5. aggiornare quantità prodotti
        6. restituire l'ordine
        } catch (error)
         res.status(500).json({message: error.message});
         }
        };
        
 
        1️⃣ crea un nuovo ordine ==> createOrder

            const createOrder = async (req, res) => {
                try {
                1. controllare che l'utente esista -> User.findById(userId)
                2. controllare prodotti e disponibilità -> app.GET/product.name = Products.find();
                3. creare l'ordine -> app.POST/Order =>{
                    const order = await Order.create ({ ... });
                    reate.newOrder (product._id++, timeStamp,) {app.GET/User.findUserById();}
                    };
                4. aggiornare quantità prodotti ->
                } catch (error) {
                 res.status (500).json({message: error.message});
                 }
                 return (newOrder)
                };

        2️⃣ getOrders

        const getOrders = async (req, res) => {
            try {
                1.recupera tutti gli ordini o solo quelli dell'utente loggato
                Order.find()
                } catch (error) {
             res.status(500).json({message: error.message});
             }
            };
            recupera tutti gli ordini
            (es. admin o... 
            
            storico utente)
        const getUserOrders = async(req, res) => {
            try{
                1. recupera tutti gli ordini dell'utente -> Order.user = user._id
                Order.findByUserName()
                } catch (error){
             res.status(500}.json({message:error.message});
            }
        };

            // Order.find(); -> per ottenere "Orders" la lista di tutti gli ordini
            // Order.findById(id); -> per ottenere un ordine specifico

        3️⃣ getOrderById
            recupera un singolo ordine

            const getOrderById = async (reqq, res) => {
                try {
                    1. recuperaun ordine specifico per ID
                    Order.findById(req.params.id)
                    } catch (error) {
                     res.status(500).json({message:error.message});
                     }
            };

            //Deve: app.get = (req, res) -> ricevere la query dal client
            //Qua dovrebbe 



        4️⃣ updateOrderStatus
            cambia stato ordine
            pending → paid → delivered

            const updateOrderStatus = async (req, res) => {
                try {
                Order.findByIdAndUpdate(req.params.id, {status: req.body.status})
                }catch(error){
                res.status(500).json} ({message: error.message});
                }
            };
                

        5️⃣ deleteOrder (opzionale)
            raramente usata, ma possibile
            
            const deleteOrder = async (req, res) => {
                try{
                Order.findByIdAndDelete(id);
                } catch (error) {
                res.status(500).json ({message: error.message}); 
                }
            };
            
            


    
            /* 🌱 FUNZIONI BUSINESS (le più importanti)


    

        6️⃣ checkProductAvailability
            Controlla:
            prodotto esiste
            quantità disponibile ≥ richiesta
        7️⃣ updateProductQuantity
            Quando ordine viene confermato:
            scala quantità prodotto
        8️⃣ calculateTotal
            Somma:
            prezzo × quantità

cosa può fare un ordine --> può cambiare la disponibilità/quantità di un prodotto se confermato.
quali controlli deve fare --> controllare che il prodotto sia disponibile, controllare che l'utente sia un utente valido.

    ✔ utente esistente
    ✔ prodotto esistente
    ✔ quantità disponibile
    ✔ ordine non duplicato
    ✔ stato valido

quali errori può generare --> può non reperire i dati del prodotto o dell'utente.

    ❌ prodotto non trovato
    ❌ utente non trovato
    ❌ quantità insufficiente
    ❌ ordine non valido
    ❌ ID malformato
    ❌ ordine già chiuso */

    module.exports = { //--> esporto le funzioni
        createOrder,
        getOrders,
        getOrderById,
        updateOrderStatus,
        deleteOrder
    };