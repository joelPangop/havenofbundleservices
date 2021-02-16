const mongoose = require('mongoose'), Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    price_discounted: {
        type: Boolean,
        require: false
    },
    price_changed_date: {
        type: Date,
        require: false
    },
    discountPrice: {
        type: Number,
        require: false
    },
    categories: {
        type: [],
        items: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    pictures: {
        type: [],
        items: String,
        require: false
    },
    averageStar: {
        type: Number,
        require: false
    },
    averages: {
        type: [],
        items: Object,
        require: false
    },
    quantity: {
        type: Number,
        require: false
    },
    sizes: {
        type: String,
        require: false
    },
    texture: {
        type: String,
        require: false
    },
    origin: {
        type: String,
        require: false
    },
    material: {
        type: String,
        require: false
    },
    type: {
        type: String,
        require: false
    }
});

module.exports = mongoose.model('Product', ProductSchema);
