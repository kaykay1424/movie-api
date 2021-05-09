// Modules

const { check, validationResult, body } = require('express-validator'),
    cors = require('cors'),
    dotenv = require('dotenv'),
    express = require('express'),
    helpers = require('./helpers.js'),
    Models = require('./models.js'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    passport = require('passport')  

const port = process.env.PORT || 8080;

dotenv.config({path: __dirname + '/.env'});

// Helper functions
const findRecord = helpers.findRecord;
const findRecords = helpers.findRecords;
const getList = helpers.getList;
const editList = helpers.editList;

// Mongoose models

const Actors = Models.Actor,
    Movies = Models.Movie,
    Users = Models.User;

mongoose.connect(process.env.MONGO_DB_URL, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false  
    }
);

const app = express();

// Middlewares

app.use(cors()); // allow requests to all domains
app.use(express.json()); // parses requests into json
app.use(morgan('common')); // log requests
app.use(express.static('public')); // serve static files in public folder
// Error handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.sendStatus(500).send('An error has ocurred!');
});

require('./passport');

// Routes

    // Actors

// Get a list of all actors 
app.get('/actors', passport.authenticate('jwt', { session: false }), (req, res) => {
    // sorting query params: birthDate, birthCountry
    // /actors?birthDate=-1 sort actors by birthDate in descending order
    // /actors?birthCountry=1 sort actors by birthCountry in ascending order

    // If query params are used, make sure query param values are either 1 or -1
    if (Object.values(req.params).length > 0 && (Object.values(req.query).indexOf('1') < 0 && Object.values(req.query).indexOf('-1') < 0)) return res.status(400).send('Please use a value of 1 (ascending order) or -1 (descending order) for each query parameter');
    
    findRecords(res, Actors, {}, {}, req.query);  
});

// Get a single actor by name
app.get('/actors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    findRecord(res, Actors, {name: req.params.name}); 
});

    // Movies

app.get('/',(req, res) => {
    res.status(200).send('Welcome to the Movies API');
});

// Get a list of all movies 
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    // sorting query params: rating, releaseYear, featured
    // /movies?rating=-1 sort movies by rating in descending order
    // /movies?releaseYear=1 sort movies by releaseYear in ascending order
    
    // If query params are used, make sure query param values are either 1 or -1
    if (Object.values(req.params).length > 0 && (Object.values(req.query).indexOf('1') < 0 && Object.values(req.query).indexOf('-1') < 0)) return res.status(400).send('Please use a value of 1 (ascending order) or -1 (descending order) for each query parameter');
    findRecords(res, Movies, {}, {}, req.query);    
});

// Get a list of featured movies 
app.get('/featured-movies', passport.authenticate('jwt', { session: false }), (req, res) => { 
    Movies.find({featured: true}, {_id: 0, name: 1})
    .then((results) => {
        if (!results) return res.status(400).send('No results found');
        results = results.map(result => {
            return result.name;
        });        
        res.status(200).json(results);
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });   
});

// Get movies favorited by users
app.get('/favorite-movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find({}, {favoriteMovies: 1} )
    .populate('favoriteMovies', 'name-_id').exec((err, results) => {
        let favoriteMoviesObject = {};
        let favoriteMoviesArray = [];

        // get number of favorites by users for each movie
        results.forEach((result) => {
            result.favoriteMovies.forEach(({name}) => {
                // add 1 each time movie appears
                favoriteMoviesObject[name]
                ? favoriteMoviesObject[name] = favoriteMoviesObject[name] + 1
                : favoriteMoviesObject[name] = 1;
            })
        });

        // convert favoriteMoviesObject into array to sort movies by number of favorites by users
        for (let movie in favoriteMoviesObject) {
            favoriteMoviesArray.push({
                name: movie,
                usersFavorited: favoriteMoviesObject[movie]
            });
        }

        // sort favorited movies from highest to lowest number of favorites
        favoriteMoviesArray.sort((movie1, movie2) => {
            return movie2.usersFavorited - movie1.usersFavorited;
        });

        res.json(favoriteMoviesArray);
    });
});

// Get a single movie by name
app.get('/movies/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    findRecord(res, Movies, {name: req.params.name});
});

// Get stars of a movie by movie name
app.get('/movies/:name/stars', passport.authenticate('jwt', { session: false }), (req, res) => {
    findRecord(res, Movies, {name: req.params.name}, {'stars': 1, '_id': 0});  
});

// Get a single genre by name
app.get('/genres/:name', passport.authenticate('jwt', { session: false }), (req, res) => {    
    findRecord(res, Movies, {'genre.name': req.params.name}, {'genre': 1, '_id': 0});        
});

// Get a single director by name
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    findRecord(res, Movies, {'director.name': req.params.name}, {'director': 1, '_id': 0});            
});

    // Users

require('./auth')(app); // login route

// Create a new user
app.post('/users', 
// Validation logic
[
    check('username', 'Username is required').not().isEmpty(),
    check('username', 'Username must have at least 6 characters').optional().isLength({min: 6}),
    check('username', 'Username can only contain alphanumeric characters').optional().isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').optional().isEmail(),
    check('birthDate', 'birthDate is not valid').optional().isDate(),
    
], (req, res) => {

    const errors = validationResult(req);
    // Check if there are validation errors
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = req.body;
    const hashedPassword = Users.hashPassword(req.body.password);
    // Check if user with that email already exists
    Users.findOne({'email': req.body.email})
    .then((existingUser) => {
        if (existingUser) return res.status(400).send('Sorry, a user with that email address already exists. Please use another email address.');    
        user['password'] = hashedPassword;
        Users.create(user)
        .then((newUser) => {
            // convert document to object so version key property can be removed as user does not need this info
            newUser = newUser.toObject();
            delete newUser["__v"];

            res.status(201).json(newUser);
        }).catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });    
});

// Delete a user
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const id = req.params.id;
    const filter = {_id: id};

    // Check if user exists
    Users.findOne(filter)
    .then((existingUser) => {
        if (!existingUser) return res.status(400).send('Sorry, that user doesn\'t exist.');            
        Users.findOneAndDelete(filter)
        .then((result) => {
            console.log(result)
            res.status(200).send(`User with ID ${id} has been removed.`);
        }).catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });   
});

// Get user's info
app.get('/users/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    findRecord(res, Users, {_id: req.params.id});            
});

// Update user's info
app.patch('/users/:id', // Validation logic
[
    check('username', 'username must have at least 6 characters').optional().isLength({min: 6}),
    check('username', 'username can only contain alphanumeric characters.').optional().isAlphanumeric(),
    check('email', 'email does not appear to be valid').optional().isEmail(),
    check('birthDate', 'birthDate is not valid').optional().isDate()
], passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = validationResult(req);
    // Check if there are validation errors
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    
    const user = req.body; 
    const filter = {_id: req.params.id};

    // Check if user exists
    Users.findOne(filter)
    .then((existingUser) => {
        if (!existingUser) return res.status(400).send('Sorry, that user doesn\'t exist.');    
        Users.findOneAndUpdate(filter, {$set: user}, {new: true })
        .then((updatedUser) => {
            // convert document to object so version key property can be removed as user does not need this info
            updatedUser = updatedUser.toObject();
            delete updatedUser["__v"];

            // Remove properties that weren't updated, so user only sees fields they updated
            Object.keys(updatedUser).forEach(key => {
                if (!user.hasOwnProperty(key)) delete updatedUser[key];
            });
            
            res.status(201).json(updatedUser);
        }).catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });   
});

// Get a user's favorite movies list
app.get('/users/:id/favorite-movies', passport.authenticate('jwt', { session: false }), (req, res) => {  
    getList(res, Users, {_id: req.params.id}, {favoriteMovies: 1, _id: 0}, 'favoriteMovies');        
});

// Add a movie to user's favorite movies list
app.patch('/users/:id/favorite-movies/:movie_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    editList(req, res, 'favoriteMovies', 'movie_id', 'add', Users);    
});

// Remove a movie from user's favorites list
app.delete('/users/:id/favorite-movies/:movie_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    editList(req, res, 'favoriteMovies', 'movie_id', 'remove', Users);  
});

// Get a user's to watch movies list
app.get('/users/:id/to-watch-movies', passport.authenticate('jwt', { session: false }), (req, res) => {  
    getList(res, Users, {_id: req.params.id}, {toWatchMovies: 1, _id: 0}, 'toWatchMovies');        
});

// Add a movie to user's to watch movies list
app.patch('/users/:id/to-watch-movies/:movie_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    editList(req, res, 'toWatchMovies', 'movie_id', 'add', Users);  
});

// Remove a movie from user's to watch movies list
app.delete('/users/:id/to-watch-movies/:movie_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    editList(req, res, 'toWatchMovies', 'movie_id', 'remove', Users);  
});

// Get a user's favorite actors list
app.get('/users/:id/favorite-actors', passport.authenticate('jwt', { session: false }), (req, res) => {  
    getList(res, Users, {_id: req.params.id}, {actors: 1, _id: 0}, 'favoriteActors');        
});

// Add an actor to user's favorite actors list
app.patch('/users/:id/favorite-actors/:actor_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    editList(req, res, 'favoriteActors', 'actor_id', 'add', Users);  
});

// Remove an actor from user's favorite actors list
app.delete('/users/:id/favorite-actors/:actor_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    editList(req, res, 'favoriteActors', 'actor_id', 'remove', Users);  
});

app.listen(port, '0.0.0.0',(err) => {
    console.log('Listening on Port ' + port);
});

