const mongoose = require('mongoose'), Schema = mongoose.Schema;
const product = require("./Product").schema;

const BundleSetSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    features: {
        type: [],
        items: product,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    supplement: {
        type: Object,
        require: true
    }
});

module.exports = mongoose.model('BundleSet', BundleSetSchema);
