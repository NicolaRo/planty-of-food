/* RESPONSABILITÀ DEL FILE:

1. testare la funzione -> updateUser
   scenario a) Successo → status 200 + json utente aggiornato
      • Input valido (params.id + body aggiornamento)
      • Deve chiamare User.findByIdAndUpdate con i dati giusti
      • Deve ritornare res.status(200) + res.json({utente aggiornato})

   scenario b) ID non trovato → status 404
      • ID inesistente
      • Non deve aggiornare niente
      • Deve ritornare res.status(404) + messaggio di errore

   scenario c) Fallimento DB → status 500
      • User.findByIdAndUpdate genera errore
      • Deve ritornare res.status(500) + messaggio di errore
*/

const { expect } = require ('chai');
const sinon = require('sinon');

const userController = require('../../../src/config/controllers/userController');
const User = require('../../../src/config/models/User');

describe('Update User Controller', () => {
    afterEach(()=> {
        sinon.restore();
    });

    it('should update a user and return 200', async()=> {
    
    //ARRANGE
    //Creo un req finto con params.id e body con i nuovi dati dell'utente
    const req = {
        params: { id: '123fakeid'},
        body: {
            name: 'Luigi',
            surname: 'Verdi',
            email: 'luigi@example.com'
        }
    };

    //Creo un finto res con:
    //-status: stub che restituisce se stesso per permettere chain.status().json()
    //-json: spy per osservare cosa viene passato
    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
    };

    //Creo fakeUser aggiornato, cioè quello che il DB restituirebbe
    const fakeUpdatedUser = {
        _id: '123fakeid',
        name: 'Luigi',
        surname: 'Verdi',
        email: 'luigi@example.com'
    };

    //Stubbo User.findByIdAndUpdate per simulare il SB
    const updateStub = sinon.stub(User, 'findByIdAndUpdate').resolves(fakeUpdatedUser);

    //ACT
    // Chiamo la funzione updateUser con req e res finti
    await userController.updateUser(req, res);
    
    //ASSERT
    //Controllo che la funzione abbia chiamato il DB con ID e body corretti
    expect(updateStub.calledOnce).to.be.true;

    expect(updateStub.firstCall.args[0]).to.equal('123fakeid');

    expect(updateStub.firstCall.args[1]).to.deep.equal(req.body);

    expect(updateStub.firstCall.args[2]).to.include({new:true});

    expect(updateStub.firstCall.args[2]).to.include({runValidators: true});

    //Ripristino lo stub per non contaminare altri test
    updateStub.restore();
    });
    it('should return 404 if the user ID does not exist', async () => {
        //ARRANGE
        const req = {
            params: { id: 'nonexistent-id'},
            body:{
                name: 'Luigi',
                surname: 'Verdi',
                email: 'luigi@example.com'
            }
        };
        
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        //stub di findByIdAndUpdate per simulare ID inesistente (ritorna null)
        const updateStub = sinon.stub(User, 'findByIdAndUpdate').resolves(null);

        //ACT
        await userController.updateUser(req, res);

        //ASSERT
        //Verifica che il DB sia stato chiamato con i parametri corretti
        expect(updateStub.calledOnce).to.be.true;

        expect(updateStub.firstCall.args[0]).to.equal('nonexistent-id');
        
        expect(updateStub.firstCall.args[1]).to.deep.equal(req.body);

        expect(updateStub.firstCall.args[2]).to.include({new: true, runValidators: true});

        expect(res.status.calledOnceWith(404)).to.be.true;

        expect(res.json.calledOnceWithMatch({message: "Utente non trovato"})).to.be.true;

        updateStub.restore();
    });
    it('should return 500 if the DB fails', async() => {
        //ARRANGE 
        const req = {
            params: {id: '123fakeid'},
            body: {
                name:'Luigi',
                surname: 'Verdi',
                email: 'luigi@example.com'
            }
        };
        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        //Stub di findByIdAndUpdate per simulare errore DB

        const updateStub = sinon.stub(User, 'findByIdAndUpdate').rejects(new Error('DB failure'));

        //ACT
        await userController.updateUser(req,res);

        //ASSERT
        expect(updateStub.calledOnce).to.be.true;

        expect(res.status.calledOnceWith(500)).to.be.true;

        expect(res.json.calledOnceWithMatch({message: 'DB failure'})).to.be.true;

        // Ripristino Stub
        updateStub.restore();
    });


});