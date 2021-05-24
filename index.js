/********* Modules ********/

const {check, validationResult} = require('express-validator'),
    cors = require('cors'),
    dotenv = require('dotenv'),
    express = require('express'),
    {
        findRecord,
        findRecords,
        editList,
        getList
    } = require('./helpers'),
    Models = require('./models.js'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    passport = require('passport');  

/*********** Environment Setup **********/    

dotenv.config({path: __dirname + '/.env'});

const port = process.env.PORT || 8080,
    environment = process.env.NODE_ENV || 'development',
    dbURL = environment === 'development' 
        ? process.env.MONGO_DB_DEVELOPMENT_URI 
        : process.env.MONGO_DB_PRODUCTION_URI;

/********** Mongoose ***********/

const {
    Actor,
    Movie,
    User
} = Models;

mongoose.connect(dbURL, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false  
    }
);

const app = express();

/*********** Middlewares ***********/

app.use(cors()); // allow requests to all domains
app.use(express.json()); // parses requests into json
app.use(morgan('common')); // log requests
app.use(express.static('public')); // serve static files in public folder
// Error handler
app.use((err, req, res, next) => { // eslint-disable-line
    res.status(500).send('An error has ocurred!');
});

require('./passport');

/*********** Routes ***********/

app.get('/',(req, res) => {
    res.status(200).send('Welcome to the myFlix API');
});

/*********** -Actors ***********/

// Get a list of all actors 
app.get(
    '/actors', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    // sorting query params: birthDate, birthCountry
    // /actors?birthDate=-1 sort actors by birthDate in descending order
    // /actors?birthCountry=1 sort actors by birthCountry in ascending order

        // If query params are used, 
        // make sure query param values are either 1 or -1
        if (Object.values(req.params).length > 0 
        && (Object.values(req.query).indexOf('1') < 0 
        && Object.values(req.query).indexOf('-1') < 0)) 
            return res
                .status(400)
                .send(`Please use a value of 1 (ascending order)
            or -1 (descending order) for each query parameter`);
    
        findRecords(Actor, {}, {}, req.query)
            .then(actors => res.status(200).json(actors),
                err => res.status(err.status || 500).send(err.message || err)
            );
    });

// Get a single actor by name
app.get(
    '/actors/:name', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        findRecord(Actor, {name: req.params.name})
            .then(actor => res.status(200).json(actor),
                err => res.status(err.status || 500).send(err.message || err)
            );
    });

/*********** -Movies ***********/

// Get a list of all movies 
app.get(
    '/movies', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    // sorting query params: rating, releaseYear, featured
    // /movies?rating=-1 sort movies by rating in descending order
    // /movies?releaseYear=1 sort movies by releaseYear in ascending order
    
        // If query params are used, 
        // make sure query param values are either 1 or -1
        if (Object.values(req.params).length > 0 
        && (Object.values(req.query).indexOf('1') < 0 
        && Object.values(req.query).indexOf('-1') < 0)) 
            return res
                .status(400)
                .send(`Please use a value of 1 (ascending order) 
                or -1 (descending order) for each query parameter`);
        
        findRecords(Movie, {}, {}, req.query)
            .then(movies => res.status(200).json(movies),
                err => res.status(err.status || 500).send(err.message || err)
            );    
    });

// Get a list of featured movies 
app.get(
    '/featured-movies', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => { 
        Movie.find({featured: true}, {_id: 0, name: 1}).then((results) => {
            if (!results) return res.status(400).send('No results found');
            // create array of movie names
            results = results.map(result => {
                return result.name;
            });        
            res.status(200).json(results);
        }, (err) => res.status(500).send(err));      
    });

// Get movies favorited by users
app.get(
    '/favorite-movies', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        User.find(
            {}, 
            {favoriteMovies: 1})
            .populate('favoriteMovies', 'name-_id').exec((err, results) => {
                const favoriteMoviesObject = {};
                const favoriteMoviesArray = [];

                // get number of favorites by users for each movie
                results.forEach((result) => {
                    result.favoriteMovies.forEach(({name}) => {
                        // add 1 each time movie appears
                        favoriteMoviesObject[name]
                            ? favoriteMoviesObject[name]
                        = favoriteMoviesObject[name] + 1
                            : favoriteMoviesObject[name] = 1;
                    });
                });

                // convert favoriteMoviesObject into array
                // to sort movies by number of favorites by users
                for (const movie in favoriteMoviesObject) {
                    favoriteMoviesArray.push({
                        name: movie,
                        usersFavorited: favoriteMoviesObject[movie]
                    });
                }

                // sort movies from highest to lowest number of favorites
                favoriteMoviesArray.sort((movie1, movie2) => {
                    return movie2.usersFavorited - movie1.usersFavorited;
                });

                res.json(favoriteMoviesArray);
            }, (err) => res.status(500).send(err));   
    });

// Get a single movie by name
app.get(
    '/movies/:name', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        findRecord(Movie, {name: req.params.name})
            .then(stars => res.status(200).json(stars),
                err => res.status(err.status || 500).send(err.message || err)
            );
    });

// Get stars of a movie by movie name
app.get(
    '/movies/:name/stars', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        findRecord(Movie, {name: req.params.name}, {'stars': 1, '_id': 0})
            .then(stars => res.status(200).json(stars),
                err => res.status(err.status || 500).send(err.message || err)
            );  
    });

// Get a single genre by name
app.get(
    '/genres/:name', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {    
        findRecord(Movie,
            {'genre.name': req.params.name},
            {'genre': 1, '_id': 0})
            .then(user => res.status(200).json(user),
                err => res.status(err.status || 500).send(err.message || err)
            );        
    });

// Get a single director by name
app.get(
    '/directors/:name', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        findRecord(Movie, 
            {'director.name': req.params.name}, 
            {'director': 1, '_id': 0})
            .then(user => res.status(200).json(user),
                err => res.status(err.status || 500).send(err.message || err)
            );            
    });

/*********** -Users ***********/

require('./auth')(app); // login route

// Create a new user
app.post('/users', 
    // Validation logic
    [
        check('username', 'username is required')
            .not().isEmpty(),
        check('username', 'username must have at least 6 characters')
            .optional().isLength({min: 6}),
        check('username', 'username can only contain alphanumeric characters')
            .optional().isAlphanumeric(),
        check('password', 'password is required')
            .not().isEmpty(),
        check('email', 'email is required')
            .not().isEmpty(),
        check('email', 'email does not appear to be valid')
            .optional().isEmail(),
        check('birthDate', 'birthDate is not valid').optional().isDate(),
        
    ], (req, res) => {

        const errors = validationResult(req);
        // Check if there are validation errors
        if (!errors.isEmpty()) 
            return res.status(422).json({errors: errors.array()});

        const user = req.body,
            hashedPassword = User.hashPassword(req.body.password);
        // Check if user with that email already exists
        User.findOne({'email': req.body.email}).then((existingUser) => {
            if (existingUser) 
                return res
                    .status(400)
                    .send(`Sorry, 
                        a user with that email address already exists. 
                        Please use another email address.`);    
            
            user['password'] = hashedPassword;
            User.create(user).then((newUser) => {
                // convert document to object 
                // so version key property can be removed 
                // as user does not need this info
                newUser = newUser.toObject();
                delete newUser['__v'];

                res.status(201).json(newUser);
            }, (err) => res.status(500).send(err));          
        }, (err) => res.status(500).send(err));       
    }
);

// Delete a user
app.delete(
    '/users/:id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        const id = req.params.id;
        const filter = {_id: id};

        // Make sure user id used belongs to the user that is logged in
        if (filter._id !== String(req.user._id)) 
            return res.status(400).send('You cannot edit this user\'s info');

        // Find user
        User.findOne(filter).then(() => {            
            User.findOneAndDelete(filter).then(() => {
                res.status(200).send(`User with ID ${id} has been removed.`);
            }).catch((err) => {
            
                res.status(500).send(err);
            });        
        }, (err) => res.status(500).send(err));      
    });

// Get user's info
app.get(
    '/users/:id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    // Make sure user id used belongs to the user that is logged in
        if (req.params.id !== String(req.user._id)) 
            return res.status(400).send('You cannot edit this user\'s info');
    
        findRecord(User, {_id: req.params.id})
            .then(user => res.status(200).json(user),
                err => res.status(err.status || 500).send(err.message || err)
            );            
    });

// Update user's info
app.patch('/users/:id', // Validation logic
    [
        check('username', 'username must have at least 6 characters')
            .optional().isLength({min: 6}),
        check('username', 'username can only contain alphanumeric characters.')
            .optional().isAlphanumeric(),
        check('email', 'email does not appear to be valid')
            .optional().isEmail(),
        check('birthDate', 'birthDate is not valid').optional().isDate()
    ], passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = validationResult(req);
        // Check if there are validation errors
        if (!errors.isEmpty()) 
            return res.status(422).json({errors: errors.array()});
    
        const user = req.body,
            filter = {_id: req.params.id};
            
        // Make sure user id used belongs to the user that is logged in
        if (filter._id !== String(req.user._id)) 
            return res.status(400).send('You cannot edit this user\'s info');

        // if password has been supplied in body request, hash it    
        if (user.password) user.password = User.hashPassword(user.password);    
        
        // Find user
        User.findOne(filter).then(() => {            
            User.findOneAndUpdate(filter, {$set: user}, {new: true})
                .then((updatedUser) => {
                // convert document to object 
                // so version key property can be removed
                // as user does not need this info
                    updatedUser = updatedUser.toObject();
                    delete updatedUser['__v'];

                    // Remove properties that weren't updated,
                    // so user only sees fields they updated
                    Object.keys(updatedUser).forEach(key => {
                        if (!user.hasOwnProperty(key)) delete updatedUser[key];
                    });
                
                    res.status(201).json(updatedUser);
                }, (err) => res.status(500).send(err));          
        }, (err) => res.status(500).send(err));   
    }
);

/*********** --Editing/getting user's lists ************/

// Get a user's favorite movies list
app.get(
    '/users/:id/favorite-movies', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => { 
        getList(
            req, 
            User, 
            {_id: req.params.id}, 
            {favoriteMovies: 1, _id: 0}, 
            'favoriteMovies')
            .then(favoriteMovies => res.status(200).json(favoriteMovies))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));         
    });

// Add a movie to user's favorite movies list
app.patch(
    '/users/:id/favorite-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteMovies', 'movie_id', 'add', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));    
    });

// Remove a movie from user's favorites list
app.delete(
    '/users/:id/favorite-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteMovies', 'movie_id', 'remove', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));      
    });

// Get a user's to watch movies list
app.get(
    '/users/:id/to-watch-movies', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {  
        getList(
            req,
            User,
            {_id: req.params.id},
            {toWatchMovies: 1, _id: 0},
            'toWatchMovies')
            .then(toWatchMovies => res.status(200).json(toWatchMovies))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));         
    });

// Add a movie to user's to watch movies list
app.patch(
    '/users/:id/to-watch-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'toWatchMovies', 'movie_id', 'add', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));   
    });

// Remove a movie from user's to watch movies list
app.delete(
    '/users/:id/to-watch-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'toWatchMovies', 'movie_id', 'remove', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));   
    });

// Get a user's favorite actors list
app.get(
    '/users/:id/favorite-actors', 
    passport.authenticate('jwt', {session: false}),
    (req, res) => {  
        getList(
            req, 
            User, 
            {_id: req.params.id}, 
            {actors: 1, _id: 0}, 
            'favoriteActors')
            .then(favoriteActors => res.status(200).json(favoriteActors))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));        
    });

// Add an actor to user's favorite actors list
app.patch(
    '/users/:id/favorite-actors/:actor_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteActors', 'actor_id', 'add', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));
    });

// Remove an actor from user's favorite actors list
app.delete(
    '/users/:id/favorite-actors/:actor_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteActors', 'actor_id', 'remove', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));  
    });

app.listen(port, '0.0.0.0');

