/* userController -> CRUD
4. DELETE (deleteUser)
  4.1 Riceve ID utente
  4.2 Elimina utente -> User.findByIdAndDelete(id)
  4.3 Se non trovato -> HTTP 404
  4.4 Se eliminato -> conferma
  4.5 Gestisce errori interni -> HTTP 500
  */

  //Importo Chai e Sinon come strumenti di test
  const { expect } = require('chai');
  const sinon = require('sinon');

  //Importo userController e User ovvero i files contenenti le funzioni da testare
  const userController = require('../../../src/config/controllers/userController');
  const User = require('../../../src/config/models/User');

  //Descrivo cosa voglio testare: la funzione deleteUser all'interno di userController
  describe ('UserController - deleteUser', () => {
    
    //Creo una variabile in cui salvo la funzione deleteStub che utilizzerò per testare i vari scenari
    let deleteStub;

    //Imposto il ciclo afterEach per ripristinare lo Stub dopo il test di ciascun scenario ipotizzato
    afterEach (() => {
        if (deleteStub) deleteStub.restore();
    });

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should delete an EXISTING user', async () => {
        
        //ARRANGE
        //Creo la request passata dal client per un cliente esistente, passo ID come params
        const req = {
            params: { id: 'fakeUserId123'}
        };

        //Simulo la res ottenuta 
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        //Creo un Utente falso da eliminare
        const deletedUser = {
            _id: 'fakeUserId123',
            name: 'Nicola',
            email: 'nicola@test.com'
        };

        //Cancello l'utente individuato tramite l'ID
        deleteStub = sinon.stub(User, 'findByIdAndDelete').resolves(deletedUser);

        //ACT
        await userController.deleteUser(req, res);

        //ASSERT
        //Verifico che l'eliminazione vada a buon fine e venga restituito il messaggio corrispondente
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(deleteStub.calledOnceWith(req.params.id)).to.be.true;
    });

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 404 if user is NOT FOUND', async ()=> {
        
        //ARRANGE
        //creo una req dal client passando un ID inesistente
        const req = {
            params: {
                id: 'nonExistingId123'
            }
        };

        //Creo una res correlata
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        //cancello l'utente indicato con l'ID ed ottengo null in quanto ID inesistente
        deleteStub = sinnon.stub(User, 'findByIdAndDelete').resolves(null);

        //ACT
        await userController.deleteUser(req, res);

        //ASSERT
        //Verifico che la risposta sia conforme al codice 404 not found
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(deleteStub.calledOnceWith(req.params.id)).to.be.true;
    });

    //nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
    it('should return 500 if DB fails', async ()=> {

        //ARRANGE
        //Creo la req passata dal client indicando anyId dato che non è l'Id il motivo del DB fail
        const req = {
            params: {
            id: 'anyId'
            }
        };
        
        //Creo la res
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        //Cerco l'utente (fasullo) con l'ID e lo cancello
        deleteStub = sinon.stub(User, 'findByIdAndDelete').rejects(new Error('DB Error'));

        //ACT
        await userController.deleteUser(req, res);

        //ASSERT
        //Mi aspetto uno status code 500
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
    });
  });