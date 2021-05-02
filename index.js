// Modules

const dotenv = require('dotenv'),
express = require('express'),
Models = require('./models.js'),
mongoose = require('mongoose'),
morgan = require('morgan');

dotenv.config({path: __dirname + '/.env'});

// Mongoose models

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.MONGO_DB_URL, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false  
    }
);

const app = express();

// Middlewares

app.use(express.json()); // parses requests into json
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
    res.status(200).send('Welcome to the Movies API');
});

// Get a list of all movies by name
app.get('/movies',(req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });   
});

// Get a single movie by name
app.get('/movies/:name',(req, res) => {
    Movies.findOne({name: req.params.name})
    .then((movie) => {
        res.status(200).json(movie);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    }); 
});

// Get a single genre by name
app.get('/genres/:name',(req, res) => {    
    Movies.findOne({'genre.name': req.params.name})
    .then(({genre}) => {
        res.status(200).send(genre.description);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });        
});

// Get a single director by name
app.get('/directors/:name',(req, res) => {
    Movies.findOne({'director.name': req.params.name})
    .then(({director}) => {
        res.status(200).json(director);
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });     
});

    // Users

// Create a new user
app.post('/users', (req, res) => {
    // Check if both email, username, and password were passed in request
    if (!req.body.email || !req.body.username || !req.body.password) res.status(400).send('Please include an email, password, and a username to create an account.');        

    // Check if user with that email already exists
    Users.findOne({'email': req.body.email})
    .then((existingUser) => {
        if (existingUser) return res.status(400).send('Sorry, a user with that email address already exists. Please use another email address.');    
        Users.create(req.body)
        .then((newUser) => {
            // convert document to object so version key property can be removed as user does not need this info
            newUser = newUser.toObject();
            delete newUser["__v"];

            res.status(201).json(newUser);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('An error has occurred.' + err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });    
});

// Delete a user
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    const filter = {_id: id};

    // Check if user exists
    Users.findOne(filter)
    .then((existingUser) => {
        if (!existingUser) return res.status(400).send('Sorry, that user doesn\'t exist.');            
        Users.findOneAndDelete(filter)
        .then(() => {
            res.status(200).send(`User with ID ${id} has been removed.`);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('An error has occurred.' + err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });   
});

// Update user's info
app.patch('/users/:id', (req, res) => {
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
            
            res.status(201).json(updatedUser);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('An error has occurred.' + err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });   
});

// Add a movie to user's favorite movies list
app.patch('/users/:id/favorite-movies/:movie_id', (req, res) => {
    // Make sure path params and body params match
    if (req.body.movie_id !== req.params.movie_id) return res.status(400).send('Request body and path parameters do not match.');

    const filter = {_id: req.params.id};
    const movie_id = req.body.movie_id;

    // Check if user exists
    Users.findOne(filter)
    .then((existingUser) => {
        if (!existingUser) return res.status(400).send('Sorry, that user doesn\'t exist.');            
        // Check if user has a favorite movies list already
        let updateCondition = {$set : {favoriteMovies: [movie_id]}};
        
        if (existingUser.favoriteMovies) {
            // Check if movie is already in user's favorites list
            if (existingUser.favoriteMovies.indexOf(movie_id) > -1) return res.status(400).send('That movie is already in your favorites list. Try adding another one.');
            
            updateCondition = {$push : {favoriteMovies: movie_id}}
        } 
        
        Users.findOneAndUpdate(filter, updateCondition)
        .then(() => {
            res.status(201).send(`Movie with ID ${movie_id} has been added to your favorites list.`);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('An error has occurred.' + err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });   
});

// Remove a movie from user's favorites list
app.delete('/users/:id/favorite-movies/:movie_id', (req, res) => {
    // Make sure path params and body params match
    if (req.body.movie_id !== req.params.movie_id) return res.status(400).send('Request body and path parameters do not match.');

    const filter = {_id: req.params.id};
    const movie_id = req.body.movie_id;

    // Check if user exists
    Users.findOne(filter)
    .then((existingUser) => {
        if (!existingUser) res.status(400).send('Sorry, that user doesn\'t exist.');  
        if (!existingUser.favoriteMovies) return res.status(400).send('You do not have any movies added to your favorites list.');   
        // Check if movie exists in user's favorites list
        if (existingUser.favoriteMovies.indexOf(movie_id) < 0) return res.status(400).send('That movie is not in your favorites list. Try removing another one.');
        
        Users.findOneAndUpdate(filter, {$pull: {favoriteMovies: movie_id}})
        .then(() => {
            res.status(201).send(`Movie with ID ${movie_id} has been removed.`);
        }).catch((err) => {
            console.error(err);
            res.status(500).send('An error has occurred.' + err);
        });        
    }).catch((err) => {
        console.error(err);
        res.status(500).send('An error has occurred.' + err);
    });   
});

app.listen(8080);