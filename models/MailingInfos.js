const mongoose = require('mongoose'), Schema = mongoose.Schema;

const MailingInfosSchema = new Schema({
        firstname: {
            type: String,
            require: true
        },
        lastname: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require: true
        },
        isSent: {
            type: Boolean,
            require: true
        }
    },
    {timestamps: true});

module.exports = mongoose.model('MailingInfos', MailingInfosSchema);
