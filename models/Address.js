const mongoose = require("mongoose"), Schema = mongoose.Schema;

const AddressSchema = new Schema({
    addr_1: {
        type: String,
        require: true
    },
    addr_2: {
        type: String,
        require: false
    },
    appartNumber: {
        type: Number,
        require: false
    },
    town: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    region: {
        type: String,
        require: true
    },
    postalCode: {
        type: String,
        require: false
    }
});
module.exports = mongoose.model('Address', AddressSchema);
