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

/* CONSOLE LOG PER DEBUG

console.log(User);            // chi è User?
console.log(userController);  // chi è getUsers? */

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
      
            //Creo req e res finti
            const req = { query: {} }; 
            const res = {
              status: sinon.stub().returnsThis(), // permette chain .json()
              json: sinon.spy() // Spy per controllare cosa viene inviato
            };
      
            //2# ACT
            //Chiamo il controller con i finti req / res
            await userController.getUsers(req, res);
      
            //3# ASSERT
            //Verifico che User.find() sia stata chiamata
            expect(findStub.calledOnce).to.be.true;

            //Verifico che ritorni (200) se va tutto bene
            expect(res.status.calledOnceWith(200)).to.be.true;

            //Verifico che torni un json con l'elenco degli Users
            expect(res.json.calledOnceWithMatch(fakeUsers)).to.be.true;

            });
            
          // --- SCENARIO A: SUCCESSO ---

          it('should return 500 when DB comunication break down', async() =>{
            
            //ARRANGE
            //Stub di User.find che simula errore nel DB
            const findStub = sinon.stub(User, 'find').rejects(new Error('DB failure'));

            const req = { query: {} };
            const res = {
                status: sinon.stub().returnsThis(),
                json: sinon.spy()
            };

            //ACT

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
    });