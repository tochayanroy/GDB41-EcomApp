const mongoose = require('mongoose');

// Banner Schema
const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });



const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;