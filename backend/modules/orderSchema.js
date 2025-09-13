const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'credit_card', 'bkash'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    subtotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;