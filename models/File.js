const mongoose = require("mongoose"), Schema = mongoose.Schema;
const fileInfo = require("./FileInfo").schema;

const FileSchema = new Schema({
    fileInfo: {
        type: fileInfo,
        require: true
    },
    path: {
        type: String,
        require: true
    }
});
module.exports = mongoose.model('File', FileSchema);
