const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;