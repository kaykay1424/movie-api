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
    console.log(username + '  ' + password); // eslint-disable-line
    Users.findOne({username}, (error, user) => {
        if (error) {
            console.log(error); // eslint-disable-line
            return callback(error);
        }
    
        if (!user) {
            console.log('incorrect username'); // eslint-disable-line
            return callback(null, false,
                {message: 'Incorrect username or password.'});
        }

        if (!user.validatePassword(password)) {
            console.log('incorrect password'); // eslint-disable-line
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