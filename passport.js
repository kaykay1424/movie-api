/********* Modules *********/

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

/********** Variables *********/  

const Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

/********* Passport Strategies **********/    
     
// HTTP authentication
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, (username, password, callback) => {
    Users.findOne({username}, (error, user) => {
        if (error) {
            return callback(error);
        }
    
        if (!user) {
            return callback(null, false,
                {message: 'Incorrect username or password.'});
        }

        if (!user.validatePassword(password)) {
            return callback(null, false, {message: 'Incorrect password.'});
        }
    
        return callback(null, user);
    });
}));
    
// JWT authentication
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTSECRET
}, (jwtPayload, callback) => {       
    return Users.findById(jwtPayload._id).then((user) => { 
        return callback(null, user);
    }).catch((error) => {
        return callback(error);
    });
})
);    