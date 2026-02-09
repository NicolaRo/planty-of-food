/* prosuctController -> CRUD
    
1. CREATE -> (createProduct)
  1.1 Riceve i dati dal client(req.body) 
  1.2 Valida i dati: (name, type, quantity)
    1.2.1 se mancano name, type o quantity ritorna 400  
  1.3 Crea il prodotto nel database (product.create)
  1.4 Ritorna il prodotto creato -> HTTP 201
  1.5 Gesisce eventuali errori interni -> HTTP 500
  */