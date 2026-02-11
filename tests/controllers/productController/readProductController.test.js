/* prosuctController -> CRUD
2. READ -> (getProducts)

  2.1 Get all products 
    2.1.1 Recupera tutti i prodotti -> Product.find()
    2.1.2 Ritorna array prodotti -> HTTP 200
    2.1.3 Gestisce errori interni -> HTTP 500
    2.1.4 (Possibile filtro futuro -> Commento utile)
  
  2.2 Get product by ID
    2.2.1 Recupera prodotto tramite ID -> Product.findById(req.params.id)
    2.2.2 Se non trovato  -> HTTP 404
    2.2.3 Se trovato -> HTTP 200
    2.2.4 Gestisce errori interni -> HTTP 500
  */

    //Importo Chai, Sinon come strumenti di test
    const { expect } = require('chai');
    const sinon = require('sinon');

    //Importo productController contenente le funzioni che voglio testare
    const productController = require ('../../../src/config/controllers/productController');
    
    //Importo il modello Product reale
    const Product = require ('../../../src/config/models/Product');

    //Descrivo il gruppo di test relativo al controller
    describe('ProductController', () => {

      //Descrivo il gruppo di test relativo alla funzione getProduct
      describe('getProducts', () =>{

        //afterEach dopo ogni test, ripulisce gli stub
        afterEach(()=> {
          sinon.restore();
        });

        //--- SCENARIO A: SUCCESSO ---

        //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
        it('should return 200 and an array of products when DB call succeeds', async () => {

          //ARRANGE
          //Creo un array finto di Prodotti (fakProduct) per simulare il DB
          const fakeProducts = [{id: 1, name:'Pomodoro', type: 'vegetable', quantity: [1]}];

          //Stub di Product.find per restituire i fakeProducts
          const findStub = sinon.stub(Product, 'find').resolves(fakeProducts);

          //Creo req passata dal client contenente la query dell'utente 
          const req = { query: {} };
          
          //Creo una res con sinon.spy per controllare cosa viene inviato
          const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
          };

          //ACT
          //Chiamo il controller con i finti req / res
          await productController.getProducts(req, res);

          //ASSERT
          //Verifico che Product.find() sia stata chiamata
          expect(findStub.calledOnce).to.be.true;

          //Verifico che ritorni (200) se va tutto bene
          expect(res.status.calledOnceWith(200)).to.be.true;

          //Verifico che torni un json con l'elenco dei Products
          expect(res.json.calledOnceWithMatch(fakeProducts)).to.be.true;
        });

        //---SCENARIO B: NON TROVA L'ID PRODOTTO
        it('should return 404 failing to find the Product searched with the ID', async () =>{

          //ARRANGE
          //Simuliamo che il DB non trovi il prodotto
          const findByIdStub = sinon.stub(Product, 'findById').resolves(null);

          //Creo req con params.id (qualsiasi id non esistente)
          const req = {
            params: { id: 'nonexistent-id'}
          };

          //Creo un res finto
          const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
          };

          //ACT
          await productController.getProductById(req, res);

          //ASSERT
          //Controllo che findByID sia stato chiamato con l'ID corretto
          expect(findByIdStub.calledOnceWith('nonexistent-id')).to.be.true;

          //Controllo che lo status sia 404
          expect(res.status.calledOnceWith(404)).to.be.true;

          //controllo che il json restituisca il messaggio corretto
          expect(res.json.calledOnceWithMatch({message: 'ID Prodotto non trovato'})).to.be.true;
        
        });

        //--- SCENARIO C: DB FALLISCE ---
        it('should return 500 when DB comunication break down', async ()=> {
          
          //ARRANGE
          //Stub di Product.find che simula errore nel DB
          const findStub =sinon.stub(Product, 'find').rejects(new Error('DB failure'));

          //Creo req passata dal client contenente la query dell'utente
          const req = { query: {} };

          //Creo una res con sinon.spy per controllare cosa viene passato
          const res= {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
          };

          //ACT
          //Chiamo il controller con i finti req / res
          await productController.getProducts(req, res);

          //ASSERT
          //Controllo che findStube venga chiamata
          expect(findStub.calledOnce).to.be.true;

          //Controllo che il controller restituisca status 500
          expect(res.status.calledOnceWith(500)).to.be.true;

          //Controllo che json restituisca il messaggio di errore
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.firstCall.args[0]).to.have.property('message', 'DB failure');
        });
      });
    })
