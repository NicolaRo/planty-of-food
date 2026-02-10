/* RESPONSABILITÀ DEL FILE:

1. testare la funzione -> getUsers
    scenario a) Successo → status 200 + array utenti
    scenario b) Fallimento DB → status 500

    2. testare la funzione -> getUserById
    scenario a.1) Successo → status 200 + user
    scenario b.1) ID non trovato → 404
    scenario c) DB fallisce → 500 */


//Importo Chai, Sinon come strumenti di test
const {expect} = require('chai');
const sinon = require('sinon');

//Importo userController contenente le funzioni che voglio testare
const userController = require('../../../src/config/controllers/userController');

//Importo il modello User reale 
const User = require('../../../src/config/models/User');

//Descrivo il gruppo di test relativo al controller
describe('UserController',() => {

    //Descrivo il gruppo di test relativo alla funzione getUsers
    describe('getUsers', () => {

        // afterEach dopo ogni test, ripulisce tutti gli stub e spy
        afterEach (() => {
            sinon.restore();
        });

        // --- SCENARIO A: SUCCESSO ---

        //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
        it('should return 200 and an array of users when DB call succeeds', async () => {
            
            //1# ARRANGE
            //creo un array finto di utenti (fakeUser) per simulare il DB
            const fakeUsers = [{ id: 1, name: 'Mario', email:'mario@mail.com' }];

            //stub di User.find per resituire i fakeUsers
            const findStub = sinon.stub(User, 'find').resolves(fakeUsers);
      
            //Creo req passata dal client contenente la query dell'utente 
            const req = { query: {} }; 

            //Creo una res con sinon.spy per controllare cosa viene inviato
            const res = {
              status: sinon.stub().returnsThis(), // permette chain .json()
              json: sinon.spy() // Spy per controllare cosa viene inviato
            };
      
            //ACT
            //Chiamo il controller con i finti req / res
            await userController.getUsers(req, res);
      
            //ASSERT
            //Verifico che User.find() sia stata chiamata
            expect(findStub.calledOnce).to.be.true;

            //Verifico che ritorni (200) se va tutto bene
            expect(res.status.calledOnceWith(200)).to.be.true;

            //Verifico che torni un json con l'elenco degli Users
            expect(res.json.calledOnceWithMatch(fakeUsers)).to.be.true;

            });
            
          // --- SCENARIO B: DB FALLISCE ---

          it('should return 500 when DB comunication break down', async() =>{
            
            //ARRANGE
            //Stub di User.find che simula errore nel DB
            const findStub = sinon.stub(User, 'find').rejects(new Error('DB failure'));

            //Creo req passata dal client contenente la query dell'utente 
            const req = { query: {} };

            //Creo una res con sinon.spy per controllare cosa viene inviato
            const res = {
                status: sinon.stub().returnsThis(),
                json: sinon.spy()
            };

            //ACT
            //Chiamo il controller con i finti req / res
            await userController.getUsers(req, res);

            //ASSERT
            //controllo che findStube venga chiamata
            expect(findStub.calledOnce).to.be.true;

            //Controllo che il controller restituisca status 500
            expect(res.status.calledOnceWith(500)).to.be.true;

            //Controllo che json restituisca il messaggio di errore
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('message','DB failure');
          });
    });

    describe('getUserById', () => {
        afterEach(() => {
            sinon.restore();
        });
        
        //Di seguito testo lo scenario in cui ottengo status code 200 ed i dettagli dell'utente cercato con ID
        it('should return 200 and the user when ID exists', async() =>{
            
            //ARRANGE -> creo una una replica del file controller
            const fakeUser = {
                _id:'123',
                name: 'Mario',
                email: 'mario@email.com'
            };

            //Stub: simuliamo il DB che trova l'utente
            const findByIdStub = sinon.stub(User, 'findById').resolves(fakeUser);

            //req con params.id (IMPORTANTE)
            const req = {
                params: { id: '123' }
            };

            //res finto 
            const res =  {
                status: sinon.stub().returnsThis(),
                json: sinon.spy()
            };

            //ACT -> Qua faccio partire le logiche da testare, le stesse che regolano il file originario
            await userController.getUserById(req, res);

            //ASSERT -> qui controllo le outcomes
            //Verifico che sia stato chiamato il database
            expect(findByIdStub.calledOnceWith('123')).to.be.true;

            //Verifico di ottenere la risposta 200
            expect(res.status.calledOnceWith(200)).to.be.true;

            //Verifico di ottenere l'utente creato 
            expect(res.json.calledOnceWithMatch(fakeUser)).to.be.true;
        });

        //Di seguito testo lo scenario in cui ottengo status code 404 e non trovo i dettagli dell'utente nel DB
        it('should return 404 failing to find the User searched with the ID', async ()=> {

            //ARRANGE
            //Simuliamo che il DB NON trovi l'utente
            const findByIdStub = sinon.stub(User, 'findById').resolves(null);

            //req con params.id (qualsiasi ID non esistente)
            const req = {
                params: { id: 'nonexsistent-id'}
            };

            //res finto
            const res = {
                status: sinon.stub().returnsThis(),
                json: sinon.spy()
            };

            //ACT
            await userController.getUserById(req, res);
            
            //ASSERT
            //Controllo che findById sia stato chiamato con l'ID corretto
            expect(findByIdStub.calledOnceWith('nonexsistent-id')).to.be.true;

            //Controllo che lo status sia 404
            expect(res.status.calledOnceWith(404)).to.be.true;

            //Controllo che il json restituisca il messaggio corretto
            expect(res.json.calledOnceWithMatch({message: "ID Utente non trovato"})).to.be.true;
        });

        //Di seguito testo lo scenario in cui ottengo status code 500 e si interrompe la comunicazione con il DB
        it('should return status code 500 and an error message when the comunication with the DB breaks down', async () => {
            
            //ARRANGE
            //Creo un utente finto da recuperare
            const findUserByIdStub = sinon.stub(User, 'findById').rejects(new Error('DB failure'));

            // Creo un req finto con un finto params (id: 123)
            const req = {
                params: {id: '123'}
            };

            //res finto 
            const res = {
                status: sinon.stub().returnsThis(),
                json: sinon.spy()
            };

            //ACT
            //Simulo un'interruzione della comunicazione con il DB
            await userController.getUserById(req, res);

            //ASSERT
            //Verifico che il DB sia stato chiamato
            expect (findUserByIdStub.calledOnceWith('123')).to.be.true;

            // Verifico di ottenere uno status code 500
            expect(res.status.calledOnceWith(500)).to.be.true;

            //Verifico di ottenere un messaggio d'errore
            expect(res.json.calledOnceWithMatch({message:'DB failure'})).to.be.true;
        });
    });
});