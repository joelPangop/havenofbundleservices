
const mongoose = require("mongoose"), Schema = mongoose.Schema;
const address = require("./Address").schema;
const telephone = require("./Telephone").schema;
const device = require("./Device").schema;

const UserInfoSchema = new Schema({
    lastName: {
        type: String,
        require: true
    },
    firstName: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    telephones: [{
        type: telephone
    }],
    devices: [{
        type: device
    }],
    address: {
        type: address
    }
});

module.exports = mongoose.model('UserInfo', UserInfoSchema);
