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
    product: {
        type: product,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    pictures: {
        type: [],
        default: [],
        items: String,
        require: false
    },
    price: {
        type: Number,
        require: true
    },
    supplement: {
        type: Object,
        require: true
    },
    likes: {
        type: [],
        items: String,
        require: false
    }
});

module.exports = mongoose.model('BundleSet', BundleSetSchema);
