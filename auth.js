/********* Modules *********/

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // local passport file

const JWTSECRET = process.env.JWTSECRET; // this has to be the same key used in the JWTStrategy

/********* Functions  *********/

const generateJWTToken = (user) => {
    return jwt.sign(user, JWTSECRET, {
        subject: user.username, // username to be encoded in the JWT
        expiresIn: '7d', // token will expire in 7 days
        algorithm: 'HS256' // algorithm used to “sign” or encode the values of the JWT
    });
};

// POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                
                const token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
};
