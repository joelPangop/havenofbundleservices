const mongoose = require("mongoose"), Schema = mongoose.Schema;

const FileInfoSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    size: {
        type: Number,
        require: true
    },
    file_type: {
        type: String,
        require: true
    },
    ownerId: {
        type: String,
        require: true
    }
});
module.exports = mongoose.model('FileInfo', FileInfoSchema);
