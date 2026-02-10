/* prosuctController -> CRUD
4. DELETE (deleteProduct)
  4.1 Riceve ID prodotto
  4.2 Elimina prodotto -> Product.findByIdAndDelete(id)
  4.3 Se non trovato -> HTTP 404
  4.4 Se eliminato -> conferma
  4.5 Gestisce errori interni -> HTTP 500
  */

  //Importo Chai e Sinon come strumenti di test
  const { expect } =require('chai');
  const sinon = require('sinon');

  //Importo productController e Product ovvero i files contenenti le funzioni da testare
  const productController = require('../../../src/config/controllers/productController');
  const Product = require('../../../src/config/models/Product');

  //Descrivo cosa voglio testare: la funzione deleteProduct all'interno di productController
  describe('ProductController - deleteProduct', () => {
    
    //Creo una variabile in cui salvo la funzione deleteStub che utilizzerò per testare i vari scenari
    let deleteStub;

    //Imposto il ciclo afterEach per ripristinare lo Stub dopo il test di ciascun scenario ipotizzato
    afterEach(() =>{
      if(deleteStub) deleteStub.restore();
    });

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should delete an EXISTING product', async () => {

      //ARRANGE
      //Creo la request passata dal client per un prodotto esistente, passo l'ID come params
      const req = {
        params: {
          id: 'fakeProductId123',
          type: 'vegetable',
          quantity: [1]
        }
      };

      //Simulo la res ottenuta
      const res= {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      //Creo un prodotto falso da eliminare
      const deleteProduct = {
        _id: 'fakeProductId123',
        type: 'vegetable',
        quantity: [1]
      };

      //Cancello il prodotto individuato tramite l'ID
      deleteStub = sinon.stub(Product, 'findByIdAndDelete').resolves(deleteProduct);

      //ACT
      await productController.deleteProduct(req, res);

      //ASSERT
      //Verifico che l'eliminazine vada a buon fine e venga restituito il messaggio corrispondente
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(deleteStub.calledOnceWith(req.params.id)).to.be.true;
    });

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 404 if a product is NOT FOUND', async () => {

      //ARRANGE
      //Creo una req dal client passando un ID Prodotto inesistente
      const req ={
        params: {
          id: 'nonExistingId123'
        }
      };

      //Creo una res correlata 
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      //Cancello l'utente indicato con l'ID ed ottengo null in quanto ID inesistente
      deleteStub = sinon.stub(Product, 'findByIdAndDelete').resolves(null);

        //ACT
        await productController.deleteProduct(req, res);

        //ASSERT
        //Verifico che la risposta sia conforme al codice 404 not found
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(deleteStub.calledOnceWith(req.params.id)).to.be.true;
    });

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 500 if DB fails', async () => {

      //ARRANGE
      //Creo la req passata dal client indicando anyId dato che non è l'Id il motivo del DB fail
      const req = {
        params: {
          id: 'anyId'
        }
      };

      //Creo la res
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      //Cerco il prodotto (fasullo) con l'ID fornito e lo cancello
      deleteStub = sinon.stub(Product, 'findByIdAndDelete').rejects(new Error ('DB Error'));

      //ACT
      await productController.deleteProduct (req, res);

      //ASSERT
      //Mi aspetto uno status code 500
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });