const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('✅ MongoDB Connected!');
});

db.on('error', (error) => {
    console.log('❌ MongoDB Connection Error:', error);
});

db.on('disconnected', () => {
    console.log('⚠️ MongoDB Disconnected!');
});