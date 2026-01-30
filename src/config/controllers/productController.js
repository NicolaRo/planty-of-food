const Product = require("../models/Product"); //Ottengo l'oggetto 'Product'. 

//productController -> responsabilità

/* Logica CRUD

Quindi:

1. Create un prodotto:
    1.1)Ricevere dati da client (req.body) 
    1.2)Validare prodotto -> se "type" non disponibile = (404)
    1.3)Creare prodotto nel DB -> Product.create()
    1.4)Restituire prodotto creato al client -> HTTP 201

2. Read prodotto:
    2.1) Ottenere lista prodotti (tutti)
        2.1.1)Recuperare tutti i prodotti -> Product.find()
        2.1.2)Possibile filtro futuro: categoria, disponibilità, prezzo ecc -> lo scrivo e lo commento?
        2.1.3)Restituire array di prodotti -> HTTP 200 => perchè non un res.json?
    
        2.2) Ottenere prodottoById (uno)
            2.2.1)Recuperare prodotto specifico -> Product.findById(req.params.id)
            2.2.2)Se non trovato -> 404
            2.2.3)Restituire prodotto -> HTTP 200

3. Update prodotto:
    3.1)Ricevere ID prodotto e dati da aggiornare 
    3.2)Validare product = controllare se prodotto esiste -> se no 404
    3.3)Aggiornare prodotto -> Product.findProductByIdAndUpdate (id, dati, {new: true});
    3.4)Restituire prodotto aggiornato

4. Delete prodotto:
    4.1)Ricevere ID prodotto
    4.2)Validare product = controllare se prodotto esiste -> se no 404
    4.3)Eliminare prodotto -> Product.findProductByIdAndDelete (id);
    4.4)Restituire conferma eliminazione */

/* ############-- CREARE UN ORDINE --############### */
    //1.1 Ricevere dati da client (req.body)
    const createProduct = async (req, res) => {
        try {
            const {name, type, quantity} = req.body;

            //1.2 Validare prodotto -> se "type" non disponibile = (404)
            if (!name || !type || quantity === undefined)
                return res.status(400).json({message: "Dati prodotto mancanti"});
            
            //1.3 Creare prodotto nel DB -> Product.create()
            const product = await Product.create({
            name,
            type,
            quantity,
        });

        //1.4 Restituire prodotto creato al client -> HTTP 201
        return res.status(201).json(product);

    } catch (error) {
            return res.status(500).json ({message: error.message});
        } 
    }

/* ############-- READ UN PRODOTTO --############### */
    //2.1 Ottenere lista prodotti (tutti)
    const getProducts = async (req, res) => {
        try {
            //2.1.1 Recuperare tutti i prodotti -> Product.find()
            const products = await Product.find();
            
            //2.1.3 Restituire array di prodotti -> HTTP 200
            return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json ({message: error.message});
        }
    };

    //2.2 Ottenere prodottoById (uno)
    const getProductById = async (req, res) => {
        try {
            //2.2.1 Recuperare prodotto specifico -> Product.findById(req.params.id)
            const product = await Product.findById(req.params.id);
            
            //2.2.2 Se non trovato -> 404
            if (!product) 
                return res.status(404).json({message: "ID Prodotto non trovato"});

            //2.2.3 Restituire prodotto -> HTTP 200
            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json ({message: error.message});
        }
    };

/* ############-- UPDATE UN PRODOTTO --############### */
    //3.1 Ricevere ID prodotto e dati da aggiornare
    const updateProduct = async (req, res) => {
    try {
        //3.3)Aggiornare prodotto -> Product.findProductByIdAndUpdate (id, dati, {new: true});
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );

        //3.2 Validare product = controllare se prodotto esiste -> se no 404
        if (!product)
            return res.status(404).json ({message: "Prodotto non trovato"});

        //3.4 Restituire prodotto aggiornato
        return res.json(product);

        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    };

/* ############-- DELETE UN PRODOTTO --############### */

    const deleteProduct = async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product)
                return res.status(404).json({message: "Impossibile eliminare prodotto non trovato"});
            
            return res.json({message: "Prodotto cancellato correttamente"});
        
        } catch (error) {
                return res.status(500).json ({message: error.message});
        }
    };
    
    module.exports = { //--> esporto le funzioni
        createProduct,
        getProducts,
        getProductById,
        updateProduct,
        deleteProduct
    };
