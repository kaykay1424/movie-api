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
/** @module Actors */

/**
 * Get a list of all actors  
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /actors 
 * <table>
 *  <tr>
 *      <th>Query Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>birthDate (optional)</td>
 *      <td>
 *          1 (ascending order) <br />
 *          -1 (descending order)
 *      </td>
 *      <td>sort actors by their birthday in ascending or descending order</td>
 *      <td>/actors?birthDate=-1</td>
 *  </tr>
 * <tr>
 *      <td>birthCountry (optional)</td>
 *      <td>
 *          any
 *      </td>
 *      <td>sort actors by their birth country in ascending or descending order</td>
 *      <td>/actors?birthCountry=-1</td>
 *  </tr>
 * </table>
 * 
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>[ 
 * { "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" },
 * { "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" },
 * { "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" }
 * ]
 * </code>
 */
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

/**
 * Get a single actor by name 
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /actors/:name 
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>name (required, case-sensitive)</td>
 *      <td>
 *          any
 *      </td>
 *      <td>get movie specified by value given for name parameter</td>
 *      <td>/actors/:name</td>
 *  </tr>
 * </table>
 * 
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>{ "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" }
 * </code>
 */
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
/** @module Movies */
/**
 * Get a list of all movies 
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /movies 
 * <table>
 *  <tr>
 *      <th>Query Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>rating (optional)</td>
 *      <td>
 *          1 (ASC)</br>
 *          -1 (DESC)</li>
 *      </td>
 *      <td>sort movies by rating in ascending or descending order</td>
 *      <td>/movies?rating=-1</td>
 *   </tr>
 *  <tr>
 *      <td>releaseYear (optional)</td>
 *      <td>
 *          1 (ASC)</br>
 *          -1 (DESC)</li>
 *      </td>
 *      <td>sort movies by releaseYear in ascending or descending order</td>
 *      <td>/movies?releaseYear=-1</td>
 *     </tr>
 *  <tr>
 *      <td>featured (optional)</td>
 *      <td>
 *          1 (true)</br>
 *          -1 (false)</li>
 *      </td>
 *      <td>sort movies by featured status</td>
 *      <td>/movies?featured=-1</td>
 *  </tr>
 * </table>
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b> json <br />
 * <b>Response Example:</b><br />
 * <code>[
        {   
        description: 'lorem ipsum',
        director: {
            bio: 'lorem ipsum',
            birth_year: 1954,
            death_year: null,
            name: 'lorem ipsum
        },
        featured: true,
        genre: {
            description: 'lorem ipsum',
            name: 'lorem ipsum'
        },
        image: 'image',
        imdbLink: 'link',
        name: 'lorem ipsum'
    },
    {   
        description: 'lorem ipsum',
      director: {
            bio: 'lorem ipsum',
            birth_year: 1954,
            death_year: null,
            name: 'lorem ipsum
        },
        featured: true,
        genre: {
            description: 'lorem ipsum',
            name: 'lorem ipsum'
        },
        image: 'image',
        imdbLink: 'link',
        name: 'lorem ipsum'
    },
    {   
        description: 'lorem ipsum',
        director: {
            bio: 'lorem ipsum',
            birth_year: 1954,
            death_year: null,
            name: 'lorem ipsum
        },
        featured: true,
        genre: {
            description: 'lorem ipsum',
            name: 'lorem ipsum'
        },
        image: 'image',
        imdbLink: 'link',
        name: 'lorem ipsum'
    }
      
]</code>
 */
app.get(
    '/movies', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {    
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

/**
 * Get a list of featured movies  
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /featured-movies
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b> json <br />
 * <b>Response Example:</b><br />
 * <code>[ "Avatar", "Titanic", "Avengers: End Game", "Coming 2 America", "The Lion King" ]</code>
 */ 
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
 
/**
 * Get movies favorited by users 
 * @function get
 * @param {string} routePath - Path to which request is made<br /> 
 * <b>Path:</b> /favorite-movies 
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b> json <br />
 * <b>Response Example:</b><br />
 * <code>[ { "name": "Toy Story", "usersFavorited": 3 }, { "name": "Titanic", "usersFavorited": 2 }, { "name": "Avatar", "usersFavorited": 2 }</code>
 */ 
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
 
/**
 * Get a single movie by name 
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /movies/:name 
 * <table>
 *  <tr>
 *      <th>Path params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *    <tr>
 *      <td>name (required, case-sensitive)</td>
 *      <td>
 *          any
 *      </td>
 *      <td>get movie by name</td>
 *      <td>/movies/Avatar</td>
 *  </tr>
 * </table>
 * 
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b> json <br />
 * <b>Response Example:</b><br />
 * <code>{   
    description: 'lorem ipsum',
    director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
}</code>
 */
app.get(
    '/movies/:name', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        findRecord(Movie, {name: req.params.name})
            .then(movie => res.status(200).json(movie),
                err => res.status(err.status || 500).send(err.message || err)
            );
    });

/**
 * Get stars of a movie by movie name
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /movies/:name/stars 
 * <table>
 *  <tr>
 *      <th>Query Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *    <tr>
 *      <td>name (required, case-sensitive)</td>
 *      <td>
 *          any
 *      </td>
 *      <td>get stars of movie by name (of movie)</td>
 *      <td>/movies/Avatar</td>
 *  </tr>
 * </table>
 * 
 * @param {middleware} passportAuth - Middleware to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b> json <br />
 * <b>Response Example:</b> <br />
 * <code>[ { "actor": "Sam Worthington", "character": "Jake Sully" }, { "actor": "Zoe Saldana", "character": "Neytiri" }, { "actor": "Sigourney Weaver", "character": "Dr. Grace Augustine" } ]</code>
 */
app.get(
    '/movies/:name/stars', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        findRecord(Movie, {name: req.params.name}, {'stars': 1, '_id': 0})
            .then(stars => res.status(200).json(stars),
                err => res.status(err.status || 500).send(err.message || err)
            );  
    });

/** @module Genres */ 
/**
 * Get a single genre by name  
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /genres/:name 
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>name (required, case-sensitive)</td>
 *      <td>
 *          any
 *      </td>
 *      <td>get genre by name</td>
 *      <td>/genres/Comedy</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 *  { "description": "A comedy film is a category of film in which the main emphasis is on humor. These films are designed to make the audience laugh through amusement and most often work by exaggerating characteristics for humorous effect.", "wikipediaLink": "https://en.wikipedia.org/wiki/Comedy_film" }
 * </code>
 */
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

/** @module Directors */
/**
 * Get a single director by name  
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /directors/:name 
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>name (required, case-sensitive)</td>
 *      <td>
 *          any
 *      </td>
 *      <td>get genre by name</td>
 *      <td>/directors/Anthony Russo</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 *  { "bio": "Anthony Russo was born on February 3, 1970 in Cleveland, Ohio, USA as Anthony J. Russo. He is a producer and director, known for Captain America: The Winter Soldier (2014), Avengers: Endgame (2019) and Avengers: Infinity War (2018).", "birthYear": 1970, "imdbLink": "https://www.imdb.com/name/nm0751577/" }
 * </code>
 */
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
/** @module Users */

/**
 * Login user  
 * @function post
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /login 
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          username: string (required) <br />
 *          password: string (required) <br />
 *      </td>
 *      <td>
 *          <code>
 *              { "username": "janedoe123", "password": "password"}</td>
 *          </code>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 * {
    "user": {
        "favoriteActors": [
            "60939311930017ce2291ae6a"
        ],
        "favoriteMovies": [
            "6088a1e84fe1a44fbe0a407f"
        ],
        "toWatchMovies": [
            "6088a1e84fe1a44fbe0a4077",
            "6088a1e84fe1a44fbe0a407f"
        ],
        "_id": "6108632d9dfd480015a42211",
        "email": "username@example.com",
        "password": "$2b$10$/Dev21KgtGbkEMWhQBT45uCeyl.axoiMr35YYBhWACjpZp.tFAAz2",
        "username": "username",
        "birthDate": "1990-08-02T00:00:00.000Z",
        "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmYXZvcml0ZUFjdG9ycyI6WyI2MDkzOTMxMTkzMDAxN2NlMjI5MWFlNmEiXSwiZmF2b3JpdGVNb3ZpZXMiOlsiNjA4OGExZTg0ZmUxYTQ0ZmJlMGE0MDdmIl0sInRvV2F0Y2hNb3ZpZXMiOlsiNjA4OGExZTg0ZmUxYTQ0ZmJlMGE0MDc3IiwiNjA4OGExZTg0ZmUxYTQ0ZmJlMGE0MDdmIl0sIl9pZCI6IjYxMDg2MzJkOWRmZDQ4MDAxNWE0MjIxMSIsImVtYWlsIjoidGVzdHVzZXI4QGV4YW1wbGUuY29tIiwicGFzc3dvcmQiOiIkMmIkMTAkL0RldjIxS2d0R2JrRU1XaFFCVDQ1dUNleWwuYXhvaU1yMzVZWUJoV0FDanBacC50RkFBejIiLCJ1c2VybmFtZSI6InRlc3R1c2VyOCIsImJpcnRoRGF0ZSI6IjE5OTAtMDgtMDJUMDA6MDA6MDAuMDAwWiIsIl9fdiI6MCwiaWF0IjoxNjI5NzQ4MjQxLCJleHAiOjE2MzAzNTMwNDEsInN1YiI6InRlc3R1c2VyOCJ9.vO1SY_P7RXD0JKupzWfk2bVhfrjHAcCBgVs1TvFmcl8"
}
 * </code>
 */
require('./auth')(app); // login route

/**
 * Create a new user 
 * @function post
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users 
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          birthDate: date (optional) <br />
 *          username: string (required, min. 6 characters, only alphanumeric characters) <br />
 *          password: string (required) <br />
 *          email: string (required) <br />
 *      </td>
 *      <td>
 *          <code>
 *              { "birthdate": "1990-01-22", "username": "janedoe123", "password": "password", "email": "janedoe@example.com"}</td>
 *          </code>
 * </tr>
 * </table>
 * 
 * @param {middleware} expressValidator - Middleware to validate request body <br />
 * username is required and must contain only alphanumeric characters and be at least 6 characters long <br />
 * password is required <br />
 * email is required <br />
 * birthDate is optional but if included it must be a date
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 * { "favoriteActors": [], "favoriteMovies": [], "toWatchMovies": [], "_id": "6096ded32b34225d4b5efb26", "username": "janedoe", "email": "janedoe@example.com", "password": "$2b$10$N5gSy25pkYcHk9l7twNFu.5wCo3nD3LQuH8qK09nqOonsN9lOZ3rC" }
 * </code>
 */
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
 
/**
 * Delete a user 
 * @function delete
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /actors 
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive)</td>
 *      <td>
 *          string
 *      </td>
 *      <td>delete user by id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>User with ID 7088b2e34fe1a44fbe0a407e has been removed.</code>
 */
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
 
/**
 * Get user's info 
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive)</td>
 *      <td>
 *          string
 *      </td>
 *      <td>get user by id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 *  { "favoriteActors": [], "favoriteMovies": [], "toWatchMovies": [], "username": "sallydoe", "email": "sallydoe@example.com", "password": "$2b$10$i/8MIFxoqUMbDfmyM8ql0un1ILicH3n14WHXX6kSZ.8QC4exK0UyG" }
 * </code>
 */
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

/**
 * Update user's info 
 * @function patch
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users 
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          birthDate: date (optional) <br />
 *          username: string (optional, min. 6 characters, only alphanumeric characters) <br />
 *          password: string (optional) <br />
 *          email: string (optional) <br />
 *      </td>
 *      <td>
 *          <code>
 *              { "birthdate": "1990-01-22"}
 *          </code>
 * </tr>
 * </table>
 * 
 * @param {middleware} expressValidator - Middleware to validate request body <br />
 * username is optional but if included must contain only alphanumeric characters and be at least 6 characters long <br />
 * password is optional <br />
 * email is optional <br />
 * birthDate is optional but if included it must be a date
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> object<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 * { "birthdate": "1990-01-22"}
 * </code>
 */
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

/**
 * Get a user's favorite movies list 
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/favorite-movies
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive)</td>
 *      <td>
 *          string
 *      </td>
 *      <td>get favorite movies list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/favorite-movies</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 *  [
    {   
    description: 'lorem ipsum',
    director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
},
{   
    description: 'lorem ipsum',
  director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
},
{   
    description: 'lorem ipsum',
    director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
}]
 * </code>
 */
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

/**
 * Add a movie to user's favorite movies list
 * @function patch
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/favorite-movies/:movie_id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          id (required, case-sensitive)<br />
 *          movie_id (required, case-sensitive)
 *      </td>
 *      <td>
 *          string
 *      </td>
 *      <td>add movie_id to favorite movies list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/favorite-movies/9088b2e35fe5a44fde0a407s</td>
 *  </tr>
 * </table>
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          id: string (required)<br />
 *          movie_id: string (required)
 *      </td>
 *      <td>
 *          <code>
 *              {"_id": "7088b2e34fe1d44fbe0a407e" "movie_id": "5088a2e34fe1a44fbe0a407e"}
 *          </code>
 *      </td>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>Item with ID 9088b2e35fe5a44fde0a407s has been added to your favoriteMovies list.</code>
 */
app.patch(
    '/users/:id/favorite-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteMovies', 'movie_id', 'add', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));    
    });

/**
 * Remove a movie from user's favorites list
 * @function delete
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/favorite-movies/:movie_id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive) <br />
 *          movie_id (required, case-sensitive)
 *      </td>
 *      <td>
 *          string
 *      </td>
 *      <td>delete movie_id from favorite movies list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/favorite-movies/9088b2e35fe5a44fde0a407s</td>
 *  </tr>
 * </table>
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          id: string (required)<br />
 *          movie_id: string (required)
 *      </td>
 *      <td>
 *          <code>
 *              {"_id": "7088b2e34fe1d44fbe0a407e" "movie_id": "5088a2e34fe1a44fbe0a407e"}
 *          </code>
 *      </td>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>Item with ID 5088a2e34fe1a44fbe0a407e has been removed from your favoriteMovies list.</code>
 */
app.delete(
    '/users/:id/favorite-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteMovies', 'movie_id', 'remove', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));      
    });

/**
 * Get a user's to watch movies list
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/to-watch-movies
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive)</td>
 *      <td>
 *          string
 *      </td>
 *      <td>get to watch movies list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/to-watch-movies</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 *  [
    {   
    description: 'lorem ipsum',
    director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
},
{   
    description: 'lorem ipsum',
  director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
},
{   
    description: 'lorem ipsum',
    director: {
        bio: 'lorem ipsum',
        birth_year: 1954,
        death_year: null,
        name: 'lorem ipsum
    },
    featured: true,
    genre: {
        description: 'lorem ipsum',
        name: 'lorem ipsum'
    },
    image: 'image',
    imdbLink: 'link',
    name: 'lorem ipsum'
}]
 * </code>
 */
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

/**
 * Add a movie to user's to watch movies list
 * @function patch
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/to-watch-movies/:movie_id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          id (required, case-sensitive)<br />
 *          movie_id (required, case-sensitive)
 *      </td>
 *      <td>
 *          string
 *      </td>
 *      <td>add movie_id to to watch movies list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/favorite-movies/9088b2e35fe5a44fde0a407s</td>
 *  </tr>
 * </table>
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          id: string (required)<br />
 *          movie_id: string (required)
 *      </td>
 *      <td>
 *          <code>
 *              {"_id": "7088b2e34fe1d44fbe0a407e" "movie_id": "5088a2e34fe1a44fbe0a407e"}
 *          </code>
 *      </td>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>Item with ID 5088a2e34fe1a44fbe0a407e has been added to your toWatchMovies list.</code>
 */
app.patch(
    '/users/:id/to-watch-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'toWatchMovies', 'movie_id', 'add', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));   
    });

/**
 * Remove a movie from user's to watch movies list 
 * @function delete
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/to-watch-movies/:movie_id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive) <br />
 *          movie_id (required, case-sensitive)
 *      </td>
 *      <td>
 *          string
 *      </td>
 *      <td>delete movie_id from to watch movies list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/to-watch-movies/9088b2e35fe5a44fde0a407s</td>
 *  </tr>
 * </table>
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          id: string (required)<br />
 *          movie_id: string (required)
 *      </td>
 *      <td>
 *          <code>
 *              {"_id": "7088b2e34fe1d44fbe0a407e" "movie_id": "5088a2e34fe1a44fbe0a407e"}
 *          </code>
 *      </td>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>Item with ID 5088a2e34fe1a44fbe0a407e has been removed from your toWatchMovies list.</code>
 */
app.delete(
    '/users/:id/to-watch-movies/:movie_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'toWatchMovies', 'movie_id', 'remove', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));   
    });

/**
 * Get a user's favorite actors list
 * @function get
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/favorite-actors
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive)</td>
 *      <td>
 *          string
 *      </td>
 *      <td>get list of favorite actors for user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/favorite-actors</td>
 *  </tr>
 * </table>
 * 
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> array<br />
 * <b>Response Format:</b>  json <br />
 * <b>Response Example:</b> <br />
 * <code>
 *  [
{ "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" },
{ "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" },
 * { "occupations": [ "Actress", "Soundtrack", "Producer" ], 
 * "starsIn": [ "Alien", "Alien: Resurrection", "Avatar", "Galaxy Quest" ], 
 * "_id": "60939311930017ce2291ae60", 
 * "bio": "lorem ipsum", 
 * "birthCountry": "country", 
 * "image": "image", "name": "Lorem Ipsum", "birthDate": "1949-10-08T00:00:00.000Z" }]
 * </code>
 */
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
 
/**
 * Add an actor to user's favorite actors list
 * @function patch
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/favorite-actors/:actor_id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          id (required, case-sensitive)<br />
 *          actor_id (required, case-sensitive)
 *      </td>
 *      <td>
 *          string
 *      </td>
 *      <td>add actor_id to favorite actors list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/favorite-actors/9088b2e35fe5a44fde0a407s</td>
 *  </tr>
 * </table>
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          id: string (required)<br />
 *          actor_id: string (required)
 *      </td>
 *      <td>
 *          <code>
 *              {"_id": "7088b2e34fe1d44fbe0a407e" "actor_id": "5088a2e34fe1a44fbe0a407e"}
 *          </code>
 *      </td>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>Item with ID 5088a2e34fe1a44fbe0a407e has been added to your favoriteActors list.</code>
 */
app.patch(
    '/users/:id/favorite-actors/:actor_id', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        editList(req, 'favoriteActors', 'actor_id', 'add', User)
            .then(updateMessage => res.status(201).send(updateMessage))
            .catch(err => res.status(err.status || 500)
                .send(err.message || err));
    });
 
/**
 * Remove an actor from user's favorite actors list
 * @function delete
 * @param {string} routePath - Path to which request is made <br />
 * <b>Path:</b> /users/:id/favorite-actors/:actor_id
 * <table>
 *  <tr>
 *      <th>Path Params</th>
 *      <th>Accepted Values</th>
 *      <th>Function</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>id (required, case-sensitive) <br />
 *          actor_id (required, case-sensitive)
 *      </td>
 *      <td>
 *          string
 *      </td>
 *      <td>delete actor_id from favorite actors list of user with id</td>
 *      <td>/users/7088b2e34fe1a44fbe0a407e/to-watch-actors/9088b2e35fe5a44fde0a407s</td>
 *  </tr>
 * </table>
 * <table>
 *  <tr>
 *      <th>Request Body</th>
 *      <th>Example</th>
 *  </tr>
 *  <tr>
 *      <td>
 *          <b>Request body type:</b> object <br />
 *          <b>Request body format:</b> json <br />
 *          <b>Request body properties:</b> <br />
 *          id: string (required)<br />
 *          actor_id: string (required)
 *      </td>
 *      <td>
 *          <code>
 *              {"_id": "7088b2e34fe1d44fbe0a407e" "actor_id": "5088a2e34fe1a44fbe0a407e"}
 *          </code>
 *      </td>
 * </tr>
 * </table>
 * @param {function} passportAuth - Method to authenticate user <br />
 * Authorization token required in request header
 * @param {function} routeHandler - Callback to handle request and send response to user <br />
 * <b>Response Type:</b> string<br />
 * <b>Response Format:</b>  text <br />
 * <b>Response Example:</b> <br />
 * <code>Item with ID 5088a2e34fe1a44fbe0a407e has been removed from your favoriteActors list.</code>
 */
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

