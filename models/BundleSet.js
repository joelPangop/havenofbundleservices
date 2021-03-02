const mongoose = require('mongoose'), Schema = mongoose.Schema;
const product = require("./Product").schema;

const BundleSetSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    features: {
        type: [],
        items: Object,
        require: true
    },
    productId: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    supplement: {
        type: Object,
        require: true
    }
});

module.exports = mongoose.model('BundleSet', BundleSetSchema);
