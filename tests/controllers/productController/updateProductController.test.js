/* prosuctController -> CRUD
3. UPDATE ->(updateProduct)
  3.1 Riceve ID prodotto + dati da aggiornare
  3.2 Aggiorna prodotto -> Product.findByIdAndUpdate(id, dati, {new: true})
  3.3 Se non trovato -> HTTP 404
  3.4 Se aggiornato -> ritorna prodotto aggiornato
  3.5 Gestisce errori interni -> HTTP 500
  */