//1. Importo le librerie di testing

//1.1 importo 'chai' per fare assertions (ovvero verifiche)
const { expect } = require('chai'); 
//1.2 importo 'sinon' per fare Stub e Spy
const sinon = require('sinon');

//2. Importo il controller da testare
const userController=require('../controllers/userController');

//3. Importo il model (User.js) per "Stubbarlo"
const User = require('../models/User')


/* *** STRUTTURA BASE DI UN TEST ***

describe('COSA sto testando', () => {
    it('dovrebbe fare X', () => {
        // Test 1
    });
    it('dovrebbe fare Y' () => {
        //test 2
    });
}); */


