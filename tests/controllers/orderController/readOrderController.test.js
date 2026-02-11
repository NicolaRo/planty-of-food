/* orderontroller -> CRUD
2. READ -> (getOrders)

  2.1 Get all orders 
    2.1.1 Recupera tutti gli ordini -> Order.find()
    2.1.2 Ritorna array ordini -> HTTP 200
    2.1.3 Gestisce errori interni -> HTTP 500
    2.1.4 (Possibile filtro futuro -> Commento utile)
  
  2.2 Get order by ID
    2.2.1 Recupera ordine tramite ID -> Order.findById(req.params.id)
    2.2.2 Se non trovato  -> HTTP 404
    2.2.3 Se trovato -> HTTP 200
    2.2.4 Gestisce errori interni -> HTTP 500
  */

    //Importo Chai, Sinon come strumenti di test
    const { expect } = require('chai');
    const sinon = require('sinon');

    //Importo orderController contenente le funzioni che voglio testare
    const orderController = require('../../../src/config/controllers/orderController');

    //Importo il modello Order reale
    const Order = require('../../../src/config/models/Order');

    //Descrivo il gruppo di test relativo al controller
    describe('OrderController', async () => {
        
        //Desctivo il gruppo di test relativo alla funzione getOrder
        describe('getOrders', ()=> {

            //afterEach dopo ogni test, ripulisce gli stub
            afterEach(() => {
                sinon.restore();
            });

            // --- SCENARIO A: SUCCESSO ---

            //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
            it('should return 200 and an array of orders when DB call succeeds', async () => {

                //ARRANGE
                //Creo un array finto di Ordini (fakeOrder) per simulare il DB
                const fakeOrders = [{ id: 1}, {id: 2}, {id: 3}];
                const findStub = sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({
                      populate: sinon.stub().resolves(fakeOrders)
                    })
                });

                //Creo la req passata dal client contenente la query dell'utente
                const req = {query: {} };

                //Creo una res con sinon.spy per controllare cosa viene inviato
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };

                //ACT
                //Chiamo il controller con i finti req/res
                await orderController.getOrders(req, res);

                //ASSERT
                //Verifico ceh Order.fing() sia stata chiamata
                expect(findStub.calledOnce).to.be.true;

                //Verifico che ritorni (200) se va tutto bene
                expect(res.status.calledOnceWith(200)).to.be.true;

                //Verifico che torni un json con l'elenco degli Orders
                expect(res.json.calledOnceWithMatch(fakeOrders)).to.be.true;
            });

            //---SCENARIO B: Cerco ordini ma il DB non ne contiene
            it('should return 200 and an empty array if there are no orders in the DB', async() => {

                //ARRANGE
                //Simulo il DB vuoto
                const findStub = sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({
                        populate: sinon.stub().resolves([])
                    })
                });

    
                //Creo req con params.id (qualsiasi id non esistente)
                const req = {
                    query: { }
                };
    
                //Creo un res finto
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };
    
                //ACT
                await orderController.getOrders(req, res);
    
                //ASSERT
                //Controllo che Order.find sia stato chiamato 
                expect(findStub.calledOnce).to.be.true;
    
                //Deve tornare HTTP 200
                expect(res.status.calledOnceWith(200)).to.be.true;
    
                //Deve tornare un array vuoto
                expect(res.json.calledOnceWithMatch([])).to.be.true;
            });

            // --- SCENARIO C: Errore DB ---
            it('should return 500 if the DB fails', async () => {

                //Simulo un errore generico del DB
                const findStub = sinon.stub(Order, 'find').throws(new Error('DB failure'));

                //Simulo una query vuota
                const req = { query: {}};
                
                //Simulo la risposta
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };

                //ACT 
                await orderController.getOrders(req, res);
            
                //ASSERT
                expect(findStub.calledOnce).to.be.true;
                expect(res.status.calledOnceWith(500)).to.be.true;
                expect(res.json.calledOnceWithMatch({message: 'DB failure'})).to.be.true;
            });

            //--- SCENARIO D: filtro per data (Ordini trovati) ---
            it('should return 200 and orders filtered by date', async () => {

                //ARRANGE
                const fakeOrders = [{ id: 1, createdAt: '2026-02-11'}];

                const findStub = sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({populate: sinon.stub().resolves(fakeOrders)})
                });

                const req = {query: {date: '2026-02-11'}};
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };
                //ACT
                await orderController.getOrders(req, res);

                //ASSERT
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWithMatch(fakeOrders)).to.be.true;
            });

            //--- SCENARIO E: filtro per data (Ordini NON trovati) ---
            it('should return 200 and an empty array if no orders are registered on that date', async () => {
                //ARRANGE
                const findStub = sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({populate: sinon.stub().resolves([]) })
                });

                const req = {query: {date: '2026-02-12'}};
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };
                //ACT
                await orderController.getOrders(req, res);

                //ASSERT
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWithMatch([])).to.be.true;
            });

             
            //SCENARIO F: filtro per userId (Ordini trovati) ---
            it('should return 200 and orders filtered by userId', async ()=> {
                //ARRANGE
                const fakeOrders = [{id: '123fakeUserId'}];

                const findStub = sinon .stub (Order, 'find').returns({
                    populate: sinon.stub().returns({populate: sinon.stub().resolves(fakeOrders)})
                });

                const req = { query: {userId: '123fakeUserId'}};
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };
                //ACT
                await orderController.getOrders(req, res);

                //ASSERT
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWithMatch(fakeOrders)).to.be.true;
            });

            //SCENARIO G: filtro per userId (Ordini NON trovati) ---
            it('should return 200 and an empty array if user has no orders', async() => {
                //ARRANGE
                const findStub = sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({ populate: sinon.stub().resolves([]) })
                });

                const req =  {query: {userId: 'nonexisting-Id'}};
                const res= {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };

                //ACT
                await orderController.getOrders(req, res);

                //ASSERT
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWithMatch([])).to.be.true;
            });

            
            //SCENARIO H: filtro per productId (Ordini trovati) ---
            it('should return 200 and orders filtered by productId', async() => {
                //ARRANGE
                const fakeOrders = [{id: '123fakeProductId'}];

                const findStub = sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({populate:sinon.stub().resolves(fakeOrders)})
                });

                const req = {query: {_id: '123fakeProductId' }};
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };

                //ACT
                await orderController.getOrders(req, res);

                //ASSERT
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWithMatch(fakeOrders)).to.be.true;
            });

            //SCENARIO I: filtro per productId (Ordini NON trovati) ---
            it('should return 200 and an empty array if no orders contain that product', async ()=> {

                //ARRANGE
                const findStub =sinon.stub(Order, 'find').returns({
                    populate: sinon.stub().returns({ populate: sinon.stub().resolves([]) })
                });

                const req = {query: {_id: 'nonexisting-id'}};
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.spy()
                };
                //ACT
                await orderController.getOrders(req,res);

                //ASSERT
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWithMatch([])).to.be.true;
            });
        });
    });