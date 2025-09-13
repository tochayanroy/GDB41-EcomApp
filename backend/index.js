const express = require('express');
const app = express();
const dotenv = require('dotenv');
const passport = require('passport');


const db = require('./config/db');
require('./middleware/passport-config')

const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');


dotenv.config();

app.use(express.json());
app.use(passport.initialize());

app.use('/user', userRoutes);
app.use('/address', addressRoutes);
app.use('/banner', bannerRoutes);
app.use('/cart', cartRoutes);
app.use('/category', categoryRoutes);
app.use('/order', orderRoutes);
app.use('/product', productRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});