const mongoose = require('mongoose');

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;