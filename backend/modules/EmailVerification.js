const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1m'
    }
});

// Model
const EmailVerificationModel = mongoose.model("EmailVerification", emailVerificationSchema);

module.exports = EmailVerificationModel;
