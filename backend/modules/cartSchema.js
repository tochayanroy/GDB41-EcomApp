const mongoose = require('mongoose');

// Cart Schema
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;