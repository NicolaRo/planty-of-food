const User = require("../models/User"); //Ottengo l'oggetto 'User'.

/* userController responsabile per ->

CRUD

1) Creare un nuovo utente
    1.1 Validare un utente
    1.2 creare un utente

2) Reperire gli utenti
    2.1 Recuperare tutti gli utenti (req.Users.body);
        2.1.1 Recuperare tutti gli utenti 
        2.1.2 Possibile filtro nome, email
        2.1.3 Restituire array Utenti -> HTTP 200 
    2.2 Recuperare un utente con ID specifico (getUserById);
        2.2.1 Recuperare un Utente specifico 
        2.2.2 Se non trovato -> 404
        2.2.3 Restituire Utente -> HTTP 200

3) Aggiornare gli utenti
    3.1 Ricevere ID Utente
    3.2 Validare ID Utente = se non esiste -> 404
    3.3 Aggiornare le informazioni di un utente con ID (getUserByIdAndUpdate);
        3.3.1 Verificare che i parametri/info che si vogliono aggiornare siano accettate da mongoose
    3.4 Restituire un Utente aggiornato

4) Eliminare un utente
    4.1 Ricevere ID Utente
    4.2 Validare ID Utente = se non esiste -> 404
    4.3 Eliminare Utente -> Utente.findUtenteByIdAndDelete(id);
    4.4 Confermare avvenuta eliminazione  */

/* ############-- CREATE UTENTE --############### */
    //1.1 Validare un utente
    const createUser = async (req, res) => {
        try {
            const {name, surname, email} = req.body;

            //1.1 Validare un utente
            if (!name || !surname || !email)
                return res.status(400).json({message: "Dati Utente mancanti"});

            // 1.2 creare un utente
            const user = await User.create({
                name,
                surname,
                email
            });
            return res.status(201).json(user);

        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    }

/* ############-- READ UTENTE --############### */

//2.1 Recuperare tutti gli utenti
const getUsers = async (req, res) => {
    try {
        const { name, email } = req.query;
    
        //2.1.2 Possibile filtro nome, email
        const filter = {};
    
        if (name)
          filter.name = { $regex: name, $options: "i" };
    
        if (email)
          filter.email = { $regex: email, $options: "i" };
    
        const users = await User.find(filter);
    
        return res.status(200).json(users);
      } catch (error) {
        return res.status(500).json ({message: error.message});
    }
};

//2.2 Recuperare un utente con ID specifico (getUserById);

const getUserById = async (req, res) => {
    try {
        //2.2.1 Recuperare un Utente specifico -> User.findById(req.params.id)
        const user = await User.findById(req.params.id);

        //2.2.2 Se non trovato -> 404
        if (!user)
            return res.status(404).json ({message: "ID Utente non trovato"});

        //2.2.3 Restituire Utente -> HTTP 200
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

/* ############-- UPDATE UTENTE --############### */

//3 Aggiornare gli utenti
const updateUser = async (req, res) => {
    try {
        //3.1 Ricevere ID Utente
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
    //3.2 Validare ID Utente = se non esiste -> 404
    if (!user)
        return res.status(404).json ({message: "Utente non trovato"});
    //3.4 Restituire un Utente aggiornato
    return res.json(user);
    } catch (error) {
        return res.status(500).json ({message: error.message});
    }
};

/* ############-- DELETE UTENTE --############### */

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).json({message: "Impossibile eliminare Utente non trovato"});
        return res.json({message: "Utente eliminato correttamente"})
    } catch (error) {
        return res.status(500).json ({message: error.message});
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
}