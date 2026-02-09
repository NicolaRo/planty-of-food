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

//Descrivo cosa voglio testare: La funzione getUser all'interno del file userController
describe('UserController',() => {
    describe('getUser', () => {

        //Nel blocco "it" specifico l'aspettativa per la funzione che vado a testare
        it('should display the details of an User created and stored in the DB', async ()=> {

        
        })
    })
})