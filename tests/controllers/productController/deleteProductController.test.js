/* prosuctController -> CRUD
4. DELETE (deleteProduct)
  4.1 Riceve ID prodotto
  4.2 Elimina prodotto -> Product.findByIdAndDelete(id)
  4.3 Se non trovato -> HTTP 404
  4.4 Se eliminato -> conferma
  4.5 Gestisce errori interni -> HTTP 500
  */