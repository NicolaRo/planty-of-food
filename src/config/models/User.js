
const mongoose = require("mongoose"); 

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Campo obbligatorio'] },
  surname: { type: String, required: [true, 'Campo obbligatorio'] },
  email: { 
    type: String, 
    required: [true, 'Campo obbligatorio'], // Uso required per indicare che il campo è obbligatorio
    unique: true, //Con 'unique' non accetto dupplicati di una stessa mail in nessun posto del DB
    match: [/^\S+@\S+\.\S+$/, 'Email non valida'] //regex indica quali parametri debba avere la mail, in questo caso: 
                                                    // ^	inizio della stringa
                                                    // \S+	uno o più caratteri non spazi
                                                    // @	il simbolo @
                                                    // \.	il punto .
                                                    // $	fine della stringa
  }/* ,
  //Predispongo per l'aggiunta di una password e di un ruolo utente (admin o user ed imposto 'user' come default)
  password: { type: String, required: true },
  role: { type: String, default: "user" } */
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
