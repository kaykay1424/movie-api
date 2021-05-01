// Modules
const db = require('./db.js'),
dotenv = require('dotenv'),
express = require('express'),
morgan = require('morgan');

dotenv.config({path: __dirname + '/.env'});

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('common')); // log requests
app.use(express.static('public')); // serve static files in public folder
// Error handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.sendStatus(500).send('An error has ocurred!');
});

// Routes

// Movies

app.get('/',(req, res) => {
    res.send('Welcome to the Movies API');
});

// Get a list of all movies by name
app.get('/movies',(req, res) => {
    db.myFlixDB.findRecords('movies')
    .then((movies) => {
        res.json(movies);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });   
});

// Get a single movie by name
app.get('/movies/:name',(req, res) => {
    db.myFlixDB.findRecord('movies', {name: req.params.name})
    .then((movies) => {
        res.json(movies);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    }); 
});

// Get a single genre by name
app.get('/genres/:name',(req, res) => {    
    db.myFlixDB.findRecord('movies', {'genre.name': req.params.name})
    .then(({genre}) => {
        res.send(genre.description);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });        
});

// Get a single director by name
app.get('/directors/:name',(req, res) => {
    db.myFlixDB.findRecord('movies', {'director.name': req.params.name})
    .then(({director}) => {
        res.json(director);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });     
});

// Users

// Register a new user
app.post('/users', (req, res) => {
    // Check if both email, username, and password were passed in request
    if (!req.body.email || !req.body.username || !req.body.password) res.status(400).send('Please include an email and a username to register a new user.');        

    // Check if user with that email already exists
    db.myFlixDB.findRecord('users', {'email': req.body.email})
    .then((result) => {
        if (result) return res.status(400).send('Sorry, a user with that email address already exists. Please use another email address.');    
        db.myFlixDB.insertRecord('users', req.body)
        .then((newUser) => {
            res.status(201).send(newUser.ops[0]);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('An error has occurred. Please try again.');
        });        
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });    
});

// Deregister a user
app.delete('/users/:id', (req, res) => {
     // Make sure path params and body params match
     if (req.body.id !== req.params.id) return res.status(400).send('Request body and path parameters do not match.');

    const id = req.body.id;
    const user = {_id: db.myFlixDB.ObjectID(id)};

    // Check if user exists
    db.myFlixDB.findRecord('users', user)
    .then((result) => {
        if (!result) return res.status(400).send('Sorry, that user doesn\'t exist.');    
        db.myFlixDB.deleteRecord('users', user)
        .then(() => {
            res.status(200).send(`User with ID ${id} has been removed.`);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('An error has occurred. Please try again.');
        });        
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });   
});

// Update user's username
app.patch('/users/:id/username', (req, res) => {
    // Make sure path params and body params match
    if (req.body.id !== req.params.id) return res.status(400).send('Request body and path parameters do not match.');

    const id = req.body.id; 
    const user = {_id: db.myFlixDB.ObjectID(id)};
    const username = req.body.username;
    // Check if user exists
    db.myFlixDB.findRecord('users', user)
    .then((result) => {
        if (!result) return res.status(400).send('Sorry, that user doesn\'t exist.');    
        db.myFlixDB.updateRecord('users', user, {$set: {username: username}})
        .then(() => {
            res.status(201).send(`Your username has been changed to ${username}.`);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('An error has occurred. Please try again.');
        });        
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });   
});

// Add a movie to user's favorite movies list
app.patch('/users/:id/favorite-movies/:movie_id', (req, res) => {
    // Make sure path params and body params match
    if (req.body.id !== req.params.id || req.body.movie_id !== req.params.movie_id) return res.status(400).send('Request body and path parameters do not match.');

    const id = req.body.id;
    const user = {_id: db.myFlixDB.ObjectID(id)};
    const movie = req.body.movie_id;

    // Check if user exists
    db.myFlixDB.findRecord('users', user)
    .then((result) => {
        if (!result) return res.status(400).send('Sorry, that user doesn\'t exist.');            
        // Check if user has a favorite movies list already
        let updateCondition = {$set : {favoriteMovies: [movie]}};
        
        if (result.favoriteMovies) {
            // Check if movie is already in user's favorites list
            if (result.favoriteMovies.indexOf(movie) > -1) return res.status(400).send('That movie is already in your favorites list. Try adding another one.');
            
            updateCondition = {$push : {favoriteMovies: movie}}
        } 
        
        db.myFlixDB.updateRecord('users', user, updateCondition)
        .then(() => {
            res.status(201).send(`${movie} has been added to your favorites list.`);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('An error has occurred. Please try again.');
        });        
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });   
});

// Remove a movie from user's favorites list
app.delete('/users/:id/favorite-movies/:movie_id', (req, res) => {
    // Make sure path params and body params match
    if (req.body.id !== req.params.id || req.body.movie_id !== req.params.movie_id) return res.status(400).send('Request body and path parameters do not match.');

    const id = req.body.id;
    const user = {_id: db.myFlixDB.ObjectID(id)};
    const movie = req.body.movie_id;

    // Check if user exists
    db.myFlixDB.findRecord('users', user)
    .then((result) => {
        if (!result) res.status(400).send('Sorry, that user doesn\'t exist.');  
        if (!result.favoriteMovies) return res.status(400).send('You do not have any movies added to your favorites list.');   
        // Check if movie exists in user's favorites list
        if (result.favoriteMovies.indexOf(movie) < 0) return res.status(400).send('That movie is not in your favorites list. Try removing another one.');
        
        db.myFlixDB.updateRecord('users', user, {$pull: {favoriteMovies: movie}})
        .then(() => {
            res.status(201).send(`Movie with ID ${movie} has been removed.`);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('An error has occurred. Please try again.');
        });        
    }).catch((err) => {
        console.log(err);
        res.status(500).send('An error has occurred. Please try again.');
    });   
});

app.listen(8080);