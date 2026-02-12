/* /* /* RESPONSABILITÀ DEL FILE:

1. testare la funzione -> updateOrder
   scenario a) Successo → status 200 + json ordine aggiornato
      • Input valido (params.id + body aggiornamento)
      • Deve chiamare Order.findByIdAndUpdate con i dati giusti
      • Deve ritornare res.status(200) + res.json({utente aggiornato})

   scenario b) ID non trovato → status 404
      • ID inesistente
      • Non deve aggiornare niente
      • Deve ritornare res.status(404) + messaggio di errore

   scenario c) Fallimento DB → status 500
      • Order.findByIdAndUpdate genera errore
      • Deve ritornare res.status(500) + messaggio di errore
*/

const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

// Importo i modelli e il controller
const Order = require('../../../src/config/models/Order');
const Product = require('../../../src/config/models/Product');
const User = require('../../../src/config/models/User');
const { updateOrder } = require('../../../src/config/controllers/orderController');

// Importo lo stockHelper
const stockHelper = require('../../../src/config/utils/stockHelper');

describe('Update Order Controller', () => {
  describe('updateOrder', () => {

    // ============================================================
    // SETUP GLOBALE - Creo la finta sessione per TUTTI i test
    // ============================================================
    let fakeSession;

    beforeEach(() => {
      // Creo una finta sessione che simula il comportamento reale di Mongoose
      fakeSession = {
        // withTransaction DEVE ESEGUIRE la callback per permettere le modifiche
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

    // TEST 1: Aggiornamento STATUS con successo

    it('should update order status and return 200', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();
      const fakeUserId = new mongoose.Types.ObjectId();

      // Creo un fakeOrder che simula un documento Mongoose
      const fakeOrder = {
        _id: fakeOrderId,
        user: fakeUserId,
        products: [
          {
            product: new mongoose.Types.ObjectId(),
            orderedQuantity: 2
          }
        ],
        status: 'pending', // Status iniziale
        // save() deve essere una funzione async che ritorna l'ordine stesso
        save: sinon.stub().resolves()
      };

      // Stub di Order.findById per restituire il fakeOrder
      sinon.stub(Order, 'findById').resolves(fakeOrder);

      // Creo la richiesta HTTP fittizia
      const req = {
        params: { id: fakeOrderId.toString() },
        body: {
          status: 'paid' // Voglio cambiare lo status a 'paid'
        }
      };

      // Creo la response fittizia
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      // ACT
      await updateOrder(req, res);

      // ASSERT - Verifica
      // 1. Verifico che Order.findById sia stato chiamato con l'ID corretto
      expect(Order.findById.calledWith(fakeOrderId.toString())).to.be.true;

      // 2. Verifico che lo status sia stato aggiornato
      expect(fakeOrder.status).to.equal('paid');

      // 3. Verifico che save() sia stato chiamato
      expect(fakeOrder.save.calledOnce).to.be.true;

      // 4. Verifico che save() sia stato chiamato con la sessione
      expect(fakeOrder.save.calledWith({ session: fakeSession })).to.be.true;

      // 5. Verifico che la risposta sia 200
      expect(res.status.calledWith(200)).to.be.true;

      // 6. Verifico che json() sia stato chiamato con l'ordine
      expect(res.json.calledWith(fakeOrder)).to.be.true;

      // 7. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

// TEST 2: Aggiornamento con NUOVI PRODOTTI

it('should add new products to order and return 200', async () => {
    // ARRANGE
    const fakeOrderId = new mongoose.Types.ObjectId();
    const fakeUserId = new mongoose.Types.ObjectId();
    const existingProductId = new mongoose.Types.ObjectId();
    const newProductId = new mongoose.Types.ObjectId();
  
    // Ordine esistente con 1 prodotto
    const fakeOrder = {
      _id: fakeOrderId,
      user: fakeUserId,
      products: [
        {
          product: existingProductId,
          orderedQuantity: 2
        }
      ],
      status: 'pending',
      //save() deve ritornare l'oggetto stesso!
      save: sinon.stub().callsFake(async function() {
        return this;
      })
    };
  
    // Stub di Order.findById
    sinon.stub(Order, 'findById').resolves(fakeOrder);
  
    // Stub di updateProductStock
    sinon.stub(stockHelper, 'updateProductStock').resolves();
  
    // Nuovi prodotti da aggiungere
    const newProducts = [
      {
        product: newProductId.toString(),
        orderedQuantity: 3
      }
    ];
  
    const req = {
      params: { id: fakeOrderId.toString() },
      body: {
        products: newProducts
      }
    };
  
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
  
    // ACT
    await updateOrder(req, res);
  
    // ASSERT
    // 1. Verifico che updateProductStock sia stato chiamato
    expect(stockHelper.updateProductStock.called).to.be.true;
  
    // 2. Verifico che sia stato chiamato con i parametri corretti
    expect(stockHelper.updateProductStock.calledWith(newProducts, fakeSession)).to.be.true;
  
    // 3. Verifico che i nuovi prodotti siano stati aggiunti
    expect(fakeOrder.products.length).to.equal(2); // 1 esistente + 1 nuovo
  
    // 4. Verifico che il secondo prodotto sia quello nuovo
    expect(fakeOrder.products[1].product).to.equal(newProductId.toString());
    expect(fakeOrder.products[1].orderedQuantity).to.equal(3);
  
    // 5. Verifico che save() sia stato chiamato
    expect(fakeOrder.save.calledOnce).to.be.true;
  
    // 6. Verifico che save() sia stato chiamato con la sessione
    expect(fakeOrder.save.calledWith({ session: fakeSession })).to.be.true;
  
    // 7. Verifico che la risposta sia 200
    expect(res.status.calledWith(200)).to.be.true;
  
    // 8. Verifico che json() sia stato chiamato con l'ordine
    expect(res.json.calledWith(fakeOrder)).to.be.true;
  });

    // TEST 3: Aggiornamento userId

    it('should update order userId and return 200', async () => {
      
        // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();
      const oldUserId = new mongoose.Types.ObjectId();
      const newUserId = new mongoose.Types.ObjectId();

      const fakeOrder = {
        _id: fakeOrderId,
        user: oldUserId, // User iniziale
        products: [],
        status: 'pending',
        save: sinon.stub().resolves()
      };

      // Stub di Order.findById
      sinon.stub(Order, 'findById').resolves(fakeOrder);

      // Stub di User.findById per verificare che il nuovo user esista
      sinon.stub(User, 'findById').resolves({
        _id: newUserId,
        name: 'Nuovo Utente'
      });

      const req = {
        params: { id: fakeOrderId.toString() },
        body: {
          userId: newUserId.toString()
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      // ACT
      await updateOrder(req, res);

      // ASSERT
      // 1. Verifico che User.findById sia stato chiamato
      expect(User.findById.calledWith(newUserId.toString())).to.be.true;

      // 2. Verifico che l'userId dell'ordine sia stato aggiornato
      expect(fakeOrder.user.toString()).to.equal(newUserId.toString());

      // 3. Verifico che save() sia stato chiamato
      expect(fakeOrder.save.calledOnce).to.be.true;

      // 4. Verifico che la risposta sia 200
      expect(res.status.calledWith(200)).to.be.true;
    });

    // TEST 4: Ordine NON TROVATO → 404

    it('should return 404 if order not found', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();

      // Stub di Order.findById che ritorna null (ordine non trovato)
      sinon.stub(Order, 'findById').resolves(null);

      const req = {
        params: { id: fakeOrderId.toString() },
        body: {
          status: 'paid'
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      // ACT
      await updateOrder(req, res);

      // ASSERT
      // 1. Verifico che Order.findById sia stato chiamato
      expect(Order.findById.calledWith(fakeOrderId.toString())).to.be.true;

      // 2. Verifico che la risposta sia 404
      expect(res.status.calledWith(404)).to.be.true;

      // 3. Verifico il messaggio di errore
      expect(res.json.calledWith({ message: 'Ordine non trovato' })).to.be.true;

      // 4. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

    // TEST 5: USER NON TROVATO (quando userId è fornito) → 404

    it('should return 404 if user not found when updating userId', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();
      const fakeUserId = new mongoose.Types.ObjectId();
      const nonExistentUserId = new mongoose.Types.ObjectId();

      const fakeOrder = {
        _id: fakeOrderId,
        user: fakeUserId,
        products: [],
        status: 'pending',
        save: sinon.stub().resolves()
      };

      // Stub di Order.findById (ordine esiste)
      sinon.stub(Order, 'findById').resolves(fakeOrder);

      // Stub di User.findById che ritorna null (user non trovato)
      sinon.stub(User, 'findById').resolves(null);

      const req = {
        params: { id: fakeOrderId.toString() },
        body: {
          userId: nonExistentUserId.toString()
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      // ACT
      await updateOrder(req, res);

      // ASSERT
      // 1. Verifico che User.findById sia stato chiamato
      expect(User.findById.calledWith(nonExistentUserId.toString())).to.be.true;

      // 2. Verifico che la risposta sia 404
      expect(res.status.calledWith(404)).to.be.true;

      // 3. Verifico il messaggio di errore
      expect(res.json.calledWith({ message: 'Utente non trovato' })).to.be.true;

      // 4. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

    // TEST 6: STATUS NON VALIDO → 422
   
    it('should return 422 if status is invalid', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();
      const fakeUserId = new mongoose.Types.ObjectId();

      const fakeOrder = {
        _id: fakeOrderId,
        user: fakeUserId,
        products: [],
        status: 'pending',
        save: sinon.stub().resolves()
      };

      // Stub di Order.findById
      sinon.stub(Order, 'findById').resolves(fakeOrder);

      const req = {
        params: { id: fakeOrderId.toString() },
        body: {
          status: 'invalid_status' // Status non permesso
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      // ACT
      await updateOrder(req, res);

      // ASSERT
      // 1. Verifico che la risposta sia 422 
      expect(res.status.calledWith(422)).to.be.true;

      // 2. Verifico che il messaggio contenga "Stato ordine non valido"
      expect(res.json.args[0][0].message).to.include('Stato ordine non valido');

      // 3. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

    // TEST 7: Errore generico del DB → 500
 
    it('should return 500 if database fails', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();

      // Stub di Order.findById che lancia un errore
      sinon.stub(Order, 'findById').rejects(new Error('Database connection failed'));

      const req = {
        params: { id: fakeOrderId.toString() },
        body: {
          status: 'paid'
        }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };

      // ACT
      await updateOrder(req, res);

      // ASSERT
      // 1. Verifico che la risposta sia 500
      expect(res.status.calledWith(500)).to.be.true;

      // 2. Verifico che ci sia un messaggio di errore
      expect(res.json.calledWith({ message: 'Errore interno del server' })).to.be.true;

      // 3. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

  });
});