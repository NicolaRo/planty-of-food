/* productController -> CRUD
    
1. CREATE -> (createProduct)
  1.1 Riceve i dati dal client(req.body) 
  1.2 Valida i dati: (name, type, quantity)
    1.2.1 se mancano name, type o quantity ritorna 400  
  1.3 Crea il prodotto nel database (product.create)
  1.4 Ritorna il prodotto creato -> HTTP 201
  1.5 Gesisce eventuali errori interni -> HTTP 500
  */

  //Importo Chai e Sinon come strumenti di test
  const { expect } = require('chai');
  const sinon = require('sinon');

  //Importo productController e Product ovvero i files contenenti le funzioni da testare
  const productController = require('../../../src/config/controllers/productController');
  const Product = require('../../../src/config/models/Product');

  //Descrivo cosa voglio testare: la funzione createProduct all'interno del file productController
  describe('ProductController', () => {

    describe('createProduct', () => {

      //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
      it('should create a product and return 201', async () =>{

        //il req. (request HTTP) che ottengo dal client mi aspetto che passi un oggetto con queste caratteristiche
        const req = {
          body: {
            name: "pomodoro",
            type: "vegetable",
            quantity: [5]
          }
        };

        //fakeProduct è ciò che ottengo nel DB una volta che la funzione createProduct viene eseguita correttamente (N.B.: viene creato un _id: così come avverrebbe in MongoDB)
        const fakeProduct = {
          name: "pomodoro",
          type: "vegetable",
          quantity: [5],
          _id: "123fakeProductId"
        };
        //Creo una variabile in cui salvo lo status ed il file json

        const res =  {
          status: sinon.stub().returnsThis(),
          json: sinon.spy()
        };

        // Qua nella variabile createStub
        const createStub = sinon.stub(Product, 'create').resolves(fakeProduct);

        //ACT
        await productController.createProduct(req, res);

        //ASSERT
        expect(res.status.calledWith(201)).to.be.true;

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.calledWithMatch({
          name:"pomodoro",
          type:"vegetable",
          quantity:[5]
        })).to.be.true;

        expect(createStub.calledOnceWith(req.body)).to.be.true;

        createStub.restore();
      });
      it('should return 400 id required data are missing', async () =>{

        const req = {
          body: {
            name: "pomodoro",
            type: "vegetable"
            //Quantity mancante
          }
        };

        //Mi aspetto che il response sia diverso in quanto il body della req. è incompleto 
        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy()
        };

        //Per verificarlo tento di creare un nuovo Product
        const createStub = sinon.stub(Product, 'create');

        //Attendo la res.
        await productController.createProduct(req, res);

        //Mi aspetto di ottenere uno status code (400)
        expect(res.status.calledWith(400)).to.be.true;

        //Mi aspetto che il .json restituisca un messaggio
        expect(res.json.calledWith({message: "Dati prodotto mancanti"})).to.be.true;
        expect(createStub.notCalled).to.be.true;

        //Ripristino lo Stub alla fine della verifica così non intacca l'esito di test futuri.
      createStub.restore();
      
      });
      it('should return 500 if the DB fails', async () => {
        //ARRANGE
        //Creo un req finto con dati validi come nel caso di successo

        const req = {
          body: {
            name: "pomodoro",
            type: "vegetable",
            quantity: [5]
          }
        };

        //Creo un res finto:
        // - status è uno stub che restituisce se stesso per poter fare .status().json()
        // - json è uno spy per osservare cosa viene passato
        const res = {
          status: sinon.stub().returnsThis(),
          json: sinon.spy()
        };

        // Stubbo Product.create per simulare un errore nel DB
        // rejects simula una Promise che fallisce con un errore
        const createStub = sinon.stub(Product, 'create').rejects(new Error("DB failure"));

        //ACT
        await productController.createProduct(req, res);

        //ASSERT
        //Verifico che il controller abbia restituito status 500
        expect(res.status.calledWith(500)).to.be.true;

        //Verifico che il messaggio dell'errore sia stato passato in res.json
        expect(res.json.calledWithMatch({message:"DB failure"})).to.be.true;

        //Ripristino Stub per non contaminare gli altri test
        createStub.restore();

      });
    });
  });