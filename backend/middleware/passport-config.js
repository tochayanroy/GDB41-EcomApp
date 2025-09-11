const userSchema = require('../modules/userSchema')
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const dotenv = require('dotenv');
dotenv.config();

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_TOKEN_SECRET_KEY
}

passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
        const user = await userSchema.findOne({ _id: jwt_payload._id }).select('-password')
        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    } catch (err) {
        console.log(err, false);

    }
}))