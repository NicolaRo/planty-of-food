/* prosuctController -> CRUD
3. UPDATE ->(updateProduct)
  3.1 Riceve ID prodotto + dati da aggiornare
  3.2 Aggiorna prodotto -> Product.findByIdAndUpdate(id, dati, {new: true})
  3.3 Se non trovato -> HTTP 404
  3.4 Se aggiornato -> ritorna prodotto aggiornato
  3.5 Gestisce errori interni -> HTTP 500
  */


  //Importo Chai e Sinon come strumenti di test
  const { expect } = require('chai');
  const sinon = require('sinon');

  //Importo productController e Product ovvero i files contenenti le funzioni da testare
  const productController = require('../../../src/config/controllers/productController');
  const Product = require('../../../src/config/models/Product');

  //Descrivo cosa voglio testare: la funzione updateProduct all'interno di productController
  describe('Update Product Controller', () =>{
    
    //afterEach dopo ogni test, ripulisce gli stub
    afterEach(()=>{
      sinon.restore();
    });

    //--- SCENARIO A: Update Product Success ---

    //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should update an existing product and return 200', async()=>{

      //ARRANGE
      //Creo un req finto con params.id e body con i nuovi dati del prodotto
      const req = {
        params: {
          id: '123fakeId'
        },
        body: {
          name: 'Pomodoro',
          type: 'vegetable',
          quantity: [2]
        }
      };

      // Creo un finto res co:
      // - Status: stub che restituisce se stesso per permetterechain.status().json()
      // - json: spy per osservare cosa viene passato
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      //Creo fakeProduct aggiornato, cioè quello che il DB restituirebbe
      const fakeUpdatedProduct = {
        _id: '123fakeId',
        name: 'Pomodoro',
        type: 'vegetable',
        quantity: [4]
      };

      //Stubbo Product.findByIdAndUpdate per simulare il DB
      const updateStub = sinon.stub(Product, 'findByIdAndUpdate').resolves(fakeUpdatedProduct);

      //ACT
      //Chiamo la funzione UpdateProduct con req e res finti
      await productController.updateProduct(req, res);

      //ASSERT
      //Controllo che la funzione abbia chiamatoil DB con ID e body corretti
      expect(updateStub.calledOnce).to.be.true;

      expect(updateStub.firstCall.args[0]).to.equal('123fakeId');

      expect(updateStub.firstCall.args[1]).to.deep.equal(req.body);

      expect(updateStub.firstCall.args[2]).to.include({new: true});

      //Ripristino lo stub per non contaminare altri test
      updateStub.restore();
    });

    //--- SCENARIO B: ID Product not found ---

    //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 404 if the product ID does not exist', async () => {
      
      //ARRANGE
      const req = {
        params: {id: 'nonexistent-id'},
        body: {
          name: 'Pomodoro',
          type: 'vegetable',
          quantity: [2]
        }
      };
      
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      //Stub di findByIdAndUpdate per simulare ID inesistente (ritorna null)
      const updateStub = sinon.stub(Product, 'findByIdAndUpdate').resolves(null);

      //ACT
      await productController.updateProduct(req, res);

      //ASSERT
      //Verifica che il DB sia chiamato con i parametri corretti 
      expect(updateStub.calledOnce).to.be.true;

      expect(updateStub.firstCall.args[0]).to.equal('nonexistent-id');

      expect(updateStub.firstCall.args[1]).to.deep.equal(req.body);

      expect(updateStub.firstCall.args[2]).to.deep.equal({ new: true });

      expect(res.status.calledOnceWith(404)).to.be.true;

      expect(res.json.calledOnceWithMatch({message: 'Prodotto non trovato'})).to.be.true;

      updateStub.restore();
    });

    //--- SCENARIO C: DB Failure ---

    //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 500 if the DB fails', async () => {

      //ARRANGE
      const req = {
        params: { id: '123fakeId'},
          body:{
            name: 'Pomodoro',
            type: 'vegetable',
            quantity: [2]
          }
        };

        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy()
        };

        //Stub di findByIdAndUpdate per simulare errore nel DB
        const updateStub = sinon.stub(Product, 'findByIdAndUpdate').rejects(new Error('DB failure'));

        //ACT
        await productController.updateProduct(req, res);

        //ASSERT
        expect(updateStub.calledOnce).to.be.true;

        expect(res.status.calledOnceWith(500)).to.be.true;

        expect(res.json.calledOnceWithMatch({message: 'DB failure'})).to.be.true;

        //Ripristino Stub
        updateStub.restore();
      });
    });
