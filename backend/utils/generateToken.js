const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');


const generateToken = async (user) => {
    try {
        const payload = { _id: user._id };
        const auth_token = jwt.sign({ ...payload }, process.env.JWT_TOKEN_SECRET_KEY);

        return Promise.resolve({ auth_token });
    } catch (err) {
        return Promise.reject(err)
    }
}

module.exports = generateToken;