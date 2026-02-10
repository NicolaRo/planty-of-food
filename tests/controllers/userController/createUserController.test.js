/* RESPONSABILITÀ DEL FILE:

1. testare la funzione -> createUsers
    scenario a) Successo → status 201 + json utente
      • Input valido (name, surname, email)
      • Deve chiamare User.create con i dati giusti
      • Deve ritornare res.status(201) + res.json({utente creato})
    scenario b) Dati mancanti ->
      • Input incompleto (campo mancante)
      • Non deve chiamare User.create
      • Deve ritornare res.status(400) + messaggio di errore
    scenario c) Fallimento DB → status 500
      • User.create genera errore
      • Deve ritornare res.status(500) + messaggio di errore
*/

//Importo Chai, Sinon come strumenti di test
const { expect } = require('chai');
const sinon = require('sinon');
//Importo userController e User ovvero i file contenenti le funzioni da testare
const userController = require('../../../src/config/controllers/userController');
const User = require('../../../src/config/models/User');

//Descrivo cosa voglio testare: la funzione createUser all'interno del file userController
describe('UserController', () => {

  describe('createUser', () => {

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should create a user and return 201', async () => {

        //il req. (reuqest HTTP) che ottengo dal client mi aspetto che passi un oggetto con queste caratteristiche
      const req = {
        body: {
          name: "Mario",
          surname: "Rossi",
          email: "mario@example.com"
        }
      };

      // fakeUser è ciò che ottengo nel DB una volta che la funzione createUser viene eseguita correttamente (N.B.: viene creato un _id: così come avverrebbe in MongoDB)
      const fakeUser = {
        name: "Mario",
        surname: "Rossi",
        email: "mario@example.com",
        _id: "123fakeid"
      };

      // creo una variabile in cui salvo lo status ed il file json
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Qua nella variabile createStub 
      const createStub = sinon.stub(User, 'create').resolves(fakeUser);

      await userController.createUser(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.calledWithMatch({
        name: "Mario",
        surname: "Rossi",
        email: "mario@example.com"
      })).to.be.true;

      expect(createStub.calledOnceWith(req.body)).to.be.true;

      createStub.restore();

    });

    // Testo anche il caso in cui createUser non passi tutti i params (qui manca la mail)
    it('should return 400 if required data is missing', async () => {

      const req = {
        body: {
          name: "Mario",
          surname: "Rossi"
          // email mancante
        }
      };

      //Mi aspetto che il response sia diverso in quanto il body della req. è incompleto
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Per verificarlo tento di creare un nuovo User
      const createStub = sinon.stub(User, 'create');

      // Attendo la res.
      await userController.createUser(req, res);

      // Mi aspetto di ottenere uno status code (400)
      expect(res.status.calledWith(400)).to.be.true;
      // Mi aspetto che il .json restituisca un messaggio 
      expect(res.json.calledWith({ message: "Dati Utente mancanti" })).to.be.true;
      expect(createStub.notCalled).to.be.true;


      //Ripristino lo Stub alla fine della verifica così non intacca l'esito di test futuri.
      createStub.restore();

    });

    it('should return 500 if the DB fails', async () => {

      //ARRANGE
      // Creo req finto con dati validi, come nel caso di successo
      const req = {
        body: {
          name: "Mario",
          surname: "Rossi",
          email: "mario@example.com"
        }
      };
    
      // Creo res finto: 
      // - status è uno stub che restituisce se stesso per poter fare .status().json()
      // - json è uno spy per osservare cosa viene passato
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
    
      // Stubbo User.create per simulare un errore del DB
      // rejects simula una Promise che fallisce con un errore
      const createStub = sinon.stub(User, 'create').rejects(new Error("DB failure"));
    
      // Chiamo la funzione createUser con req/res finti
      await userController.createUser(req, res);
    
      // Verifico che il controller abbia restituito status 500
      expect(res.status.calledWith(500)).to.be.true;
    
      // Verifico che il messaggio dell'errore sia stato passato in res.json
      expect(res.json.calledWithMatch({ message: "DB failure" })).to.be.true;
    
      // Ripristino Stub per non contaminare gli altri test
      createStub.restore();
    
    });    

  });

});
