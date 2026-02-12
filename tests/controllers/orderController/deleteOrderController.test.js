/* RESPONSABILITÀ DEL FILE:

1. testare la funzione -> deleteOrder
   scenario a) Successo → status 204
      • Input valido (params.id)
      • Deve trovare l'ordine con Order.findById
      • Deve ripristinare lo stock dei prodotti (Product.findByIdAndUpdate)
      • Deve cancellare l'ordine con Order.findByIdAndDelete
      • Deve ritornare res.status(204).send()

   scenario b) Ordine non trovato → status 500
      • ID inesistente
      • Order.findById ritorna null
      • Deve lanciare errore "Ordine non trovato"
      • Deve ritornare res.status(500) + messaggio di errore

   scenario c) Fallimento DB → status 500
      • Order.findById genera errore
      • Deve ritornare res.status(500) + messaggio di errore
*/

// Importo Chai, Sinon e Mongoose come strumenti di test
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

// Importo i modelli e il controller
const Order = require('../../../src/config/models/Order');
const Product = require('../../../src/config/models/Product');
const { deleteOrder } = require('../../../src/config/controllers/orderController');

// Descrivo cosa voglio testare: la funzione deleteOrder
describe('Delete Order Controller', () => {
  describe('deleteOrder', () => {

    // SETUP GLOBALE - Creo la finta sessione per TUTTI i test
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

    // TEST 1: Cancellazione con SUCCESSO → 204

    it('should delete order, restore stock and return 204', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();
      const fakeProductId1 = new mongoose.Types.ObjectId();
      const fakeProductId2 = new mongoose.Types.ObjectId();

      // Creo un fakeOrder con 2 prodotti
      const fakeOrder = {
        _id: fakeOrderId,
        products: [
          {
            product: fakeProductId1,
            orderedQuantity: 5
          },
          {
            product: fakeProductId2,
            orderedQuantity: 3
          }
        ],
        status: 'pending'
      };

      // Stub di Order.findById che ritorna il fakeOrder
      // IMPORTANTE: .session() deve ritornare il fakeOrder stesso!
      const findByIdStub = sinon.stub(Order, 'findById').returns({
        session: sinon.stub().resolves(fakeOrder)
      });

      // Stub di Product.findByIdAndUpdate per ripristinare lo stock
      sinon.stub(Product, 'findByIdAndUpdate').resolves();

      // Stub di Order.findByIdAndDelete per cancellare l'ordine
      const findByIdAndDeleteStub = sinon.stub(Order, 'findByIdAndDelete').returns({
        session: sinon.stub().resolves()
      });

      // Creo la richiesta HTTP fittizia
      const req = {
        params: { id: fakeOrderId.toString() }
      };

      // Creo la response fittizia
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub()
      };

      // ACT
      await deleteOrder(req, res);

      // ASSERT - Verifica
      // 1. Verifico che Order.findById sia stato chiamato con l'ID corretto
      expect(findByIdStub.calledWith(fakeOrderId.toString())).to.be.true;

      // 2. Verifico che Product.findByIdAndUpdate sia stato chiamato 2 volte (uno per prodotto)
      expect(Product.findByIdAndUpdate.callCount).to.equal(2);

      // 3. Verifico che sia stato chiamato con i parametri corretti per il primo prodotto
      expect(Product.findByIdAndUpdate.firstCall.calledWith(
        fakeProductId1,
        { $inc: { quantity: 5 } },
        { session: fakeSession }
      )).to.be.true;

      // 4. Verifico che sia stato chiamato con i parametri corretti per il secondo prodotto
      expect(Product.findByIdAndUpdate.secondCall.calledWith(
        fakeProductId2,
        { $inc: { quantity: 3 } },
        { session: fakeSession }
      )).to.be.true;

      // 5. Verifico che Order.findByIdAndDelete sia stato chiamato
      expect(findByIdAndDeleteStub.calledWith(fakeOrderId.toString())).to.be.true;

      // 6. Verifico che la risposta sia 204
      expect(res.status.calledWith(204)).to.be.true;

      // 7. Verifico che send() sia stato chiamato (senza parametri)
      expect(res.send.calledOnce).to.be.true;

      // 8. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

    // TEST 2: Ordine NON TROVATO → 500

    it('should return 500 if order not found', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();

      // Stub di Order.findById che ritorna null (ordine non trovato)
      sinon.stub(Order, 'findById').returns({
        session: sinon.stub().resolves(null)
      });

      const req = {
        params: { id: fakeOrderId.toString() }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub()
      };

      // ACT
      await deleteOrder(req, res);

      // ASSERT
      // 1. Verifico che Order.findById sia stato chiamato
      expect(Order.findById.calledWith(fakeOrderId.toString())).to.be.true;

      // 2. Verifico che la risposta sia 500
      expect(res.status.calledWith(500)).to.be.true;

      // 3. Verifico il messaggio di errore
      expect(res.json.calledWith({ message: 'Ordine non trovato' })).to.be.true;

      // 4. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

    // TEST 3: Errore generico del DB → 500

    it('should return 500 if database fails', async () => {
      // ARRANGE
      const fakeOrderId = new mongoose.Types.ObjectId();

      // Stub di Order.findById che lancia un errore
      sinon.stub(Order, 'findById').returns({
        session: sinon.stub().rejects(new Error('Database connection failed'))
      });

      const req = {
        params: { id: fakeOrderId.toString() }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub()
      };

      // ACT
      await deleteOrder(req, res);

      // ASSERT
      // 1. Verifico che la risposta sia 500
      expect(res.status.calledWith(500)).to.be.true;

      // 2. Verifico che ci sia un messaggio di errore
      expect(res.json.calledWith({ message: 'Database connection failed' })).to.be.true;

      // 3. Verifico che la sessione sia stata chiusa
      expect(fakeSession.endSession.called).to.be.true;
    });

  });
});