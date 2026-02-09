/* prosuctController -> CRUD
2. READ -> (getProducts)

  2.1 Get all products 
    2.1.1 Recupera tutti i prodotti -> Product.find()
    2.1.2 Ritorna array prodotti -> HTTP 200
    2.1.3 Gestisce errori interni -> HTTP 500
    2.1.4 (Possibile filtro futuro -> Commento utile)
  
  2.2 Get product by ID
    2.2.1 Recupera prodotto tramite ID -> Product.findById(req.params.id)
    2.2.2 Se non trovato  -> HTTP 404
    2.2.3 Se trovato -> HTTP 200
    2.2.4 Gestisce errori interni -> HTTP 500
  */