const express = require('express');
const app = express();
const dotenv = require('dotenv');
const passport = require('passport');


const db = require('./config/db');
require('./middleware/passport-config')

const userRoutes = require('./routes/userRoutes');


dotenv.config();

app.use(express.json());
app.use(passport.initialize());

app.use('/user', userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});