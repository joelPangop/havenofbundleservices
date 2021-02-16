const mongoose = require("mongoose"), Schema = mongoose.Schema;

const AddressSchema = new Schema({
    roadName: {
        type: String,
        require: true
    },
    appartNumber: {
        type: Number,
        require: true
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
        type: String
    }
});
module.exports = mongoose.model('Address', AddressSchema);
