/* orderController -> CRUD
    
1. CREATE -> (createOrder)
  1.1 Riceve i dati dal client(req.body) 
  1.2 Valida i dati: (name, type, quantity)
    1.2.1 se mancano name, type o quantity ritorna 400  
  1.3 Crea il prodotto nel database (product.create)
  1.4 Ritorna il prodotto creato -> HTTP 201
  1.5 Gesisce eventuali errori interni -> HTTP 500
  */


//Importo Chai Sinon e Mongoose come strumenti di test
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

//Importo i files contenenti le funzioni da testare
const Order = require('../../../src/config/models/Order');
const Product = require('../../../src/config/models/Product');
const User = require('../../../src/config/models/User');
const { createOrder } = require('../../../src/config/controllers/orderController');

//Descrivo cosa voglio testare: la funzione createProduct all'interno del file productController
describe('OrderController', () => {
  describe('createOrder', () => {
  
    // SETUP GLOBALE - Creo la finta sessione per TUTTI i test
    let fakeSession;

    beforeEach(() => {

      // Creo una finta sessione che simula il comportamento reale
      fakeSession = {

        withTransaction: sinon.stub().callsFake(async (callback) => {
          
            // Eseguo la callback passata (il codice dentro withTransaction)
          return await callback();
        }),
        endSession: sinon.stub()
      };

      // Stubbo mongoose.startSession() per TUTTI i test
      // Questo previene il timeout perché evita di aprire sessioni reali
      sinon.stub(mongoose, 'startSession').resolves(fakeSession);
    });

    // Pulisco tutti gli stub dopo ogni test per evitare conflitti
    afterEach(() => {
      sinon.restore();
    });

    // --- SCENARIO A: Creazione ordine con successo ---

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should create a new order and return 201', async () => {
      
        //ARRANGE
        // FASE 1: PREPARAZIONE - Creo ID validi per MongoDB
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeProductId = new mongoose.Types.ObjectId();
      const fakeOrderId = new mongoose.Types.ObjectId();

      // FASE 2: MOCK di User.findById
      // Simulo che l'utente esista nel DB
      sinon.stub(User, 'findById').resolves({
        _id: fakeUserId,
        name: 'Mario Rossi',
        email: 'mario@example.com'
      });

      // FASE 3: MOCK di Product.findById (chiamato da stockHelper)
      // IMPORTANTE: stockHelper usa Product.findById(id).session(session)
      // quindi devo restituire un oggetto che ha il metodo .session()
      const fakeProductQuery = {
        session: sinon.stub().returnsThis(), // .session() ritorna se stesso
       
        // Quando viene eseguita la query, ritorna il prodotto
        then: function(resolve) {
          resolve({
            _id: fakeProductId,
            name: 'Pomodoro Bio',
            quantity: 100, // Stock disponibile nel DB
          });
          return this;
        }
      };

      sinon.stub(Product, 'findById').returns(fakeProductQuery);

      // FASE 4: MOCK di Product.findByIdAndUpdate
      // Simulo l'aggiornamento dello stock (decremento quantità)
      sinon.stub(Product, 'findByIdAndUpdate').resolves({
        _id: fakeProductId,
        name: 'Pomodoro Bio',
        quantity: 98, // Quantità dopo l'aggiornamento
      });

      // FASE 5: MOCK di Order.create
      // Simulo la creazione dell'ordine nel DB
      sinon.stub(Order, 'create').resolves([
        {
          _id: fakeOrderId,
          user: fakeUserId,
          products: [
            {
              product: fakeProductId,
              orderedQuantity: 2
            }
          ],
          status: 'pending',
          createdAt: new Date()
        }
      ]);

      // FASE 6: PREPARAZIONE REQUEST e RESPONSE
      // Simulo la richiesta HTTP che arriva al controller
      const req = {
        body: {
          userId: fakeUserId.toString(),
          products: [
            {
              product: fakeProductId.toString(),
              orderedQuantity: 2
            }
          ]
        }
      };

      // Simulo l'oggetto response di Express
      const res = {
        status: sinon.stub().returnsThis(), // Permette il chaining: res.status(201).json(...)
        json: sinon.stub()
      };

      //ACT: ESECUZIONE del controller
      await createOrder(req, res);

      //ASSERT: Verifico che tutto sia andato bene
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.called).to.be.true;
      expect(User.findById.calledWith(fakeUserId.toString())).to.be.true;
      expect(Product.findById.calledWith(fakeProductId.toString())).to.be.true;
      expect(Product.findByIdAndUpdate.called).to.be.true;
      expect(Order.create.called).to.be.true;
      expect(fakeSession.endSession.called).to.be.true;
    });


    //--- SCENARIO B: Validazione - userId o products mancanti ---

    it('should return 400 if userId or products are missing', async () => {
      
        // NON stubbo User, Product, Order perché la validazione avviene PRIMA
      // di chiamare il DB. Il controller deve fermarsi subito.
      
      //ARRANGE
      const req = {
        body: {
          // userId mancante
          products: []
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      //ACT
      await createOrder(req, res);

      //ASSERT
      // Verifico che ritorni 400 con il messaggio corretto
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'Dati ordine mancanti o non validi' })).to.be.true;
      
      // Verifico che la sessione sia stata chiusa anche in caso di errore
      expect(fakeSession.endSession.called).to.be.true;
    });

    
    // SCENARIO C : Validazione - array products vuoto
   
    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 400 if products array is empty', async () => {
      
      //ARRANGE
        const req = {
        body: {
          userId: new mongoose.Types.ObjectId().toString(),
          products: [] // Array vuoto
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      //ACT
      await createOrder(req, res);

      //ASSERT
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'Dati ordine mancanti o non validi' })).to.be.true;
      expect(fakeSession.endSession.called).to.be.true;
    });


    // SCENARIO D: Utente non trovato nel DB

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 404 if user not found', async () => {

        //ARRANGE
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeProductId = new mongoose.Types.ObjectId();

      // Simulo che l'utente NON esista (findById ritorna null)
      sinon.stub(User, 'findById').resolves(null);

      const req = {
        body: {
          userId: fakeUserId.toString(),
          products: [
            {
              product: fakeProductId.toString(),
              orderedQuantity: 2
            }
          ]
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      //ACT
      await createOrder(req, res);

      //ASSERT
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Utente non trovato' })).to.be.true;
      expect(fakeSession.endSession.called).to.be.true;
    });

    
    // SCENARIO E: Validazione - quantità prodotto non valida
   
    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 400 if a product has invalid orderedQuantity', async () => {

        //ARRANGE
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeProductId = new mongoose.Types.ObjectId();

      const req = {
        body: {
          userId: fakeUserId.toString(),
          products: [
            {
              product: fakeProductId.toString(),
              orderedQuantity: -5 // Quantità negativa non valida
            }
          ]
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      //ACT
      await createOrder(req, res);

      //ASSERT
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ 
        message: 'Ogni prodotto deve avere id valido e quantità positiva' 
      })).to.be.true;
      expect(fakeSession.endSession.called).to.be.true;
    });
  });
});