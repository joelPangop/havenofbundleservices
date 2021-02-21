const mongoose = require("mongoose"), Schema = mongoose.Schema;

const MailSchema = new Schema({
    to: {
        type: String,
        require: true
    },
    from: {
        type: String,
        require: true
    },
    subject: {
        type: String,
        require: true
    },
    text: {
        type: String,
        require: true
    }
},
    {timestamps: true});
module.exports = mongoose.model('Mail', MailSchema);
