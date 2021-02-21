const mongoose = require("mongoose"), Schema = mongoose.Schema;

const TelephoneSchema = new Schema({
    numeroTelephone: String,
    categorieTelephone: String
});
module.exports = mongoose.model('Telephone', TelephoneSchema);