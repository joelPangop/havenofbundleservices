const mongoose = require('mongoose'), Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        default: '',
        require: true
    },
    rates: {
        type: [],
        default: [],
        items: Object,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    bundle_category: {
        type: String,
        require: true
    },
    clos_front_category: {
        type: String,
        require: true
    },
    description: {
        type: Object,
        default: {},
        require: false
    },
    pictures: {
        type: [],
        default: [],
        items: String,
        require: false
    },
    colors: {
        type: [],
        default: [],
        items: String,
        require: false
    },
    averageStar: {
        type: Number,
        require: false
    },
    sizes: {
        type: String,
        require: false
    },
    origin: {
        type: String,
        require: false
    },
    available: {
        type: Boolean,
        require: false
    },
    hairInfo: {
        type: Object,
        require: true
    },
    style: {
        type: String,
        require: false
    },
    care: {
        type: Object,
        default: {},
        require: true
    },
    likes: {
        type: [],
        items: String,
        require: false
    }
}, {timestamps: true});

module.exports = mongoose.model('Product', ProductSchema);
