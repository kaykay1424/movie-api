/*********  Modules *********/

const bcrypt = require('bcrypt'),
    mongoose = require('mongoose');

/********* Schemas *********/ 

const actorSchema = mongoose.Schema({
    bio: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    birthCountry: {
        type: String,
        required: true
    },
    deathday: Date,
    deathDate: Date,
    image: {
        type: String,
        required: true
    },
    imdbLink: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    occupations: [{type: String}],
    starsIn: [{type: String}]
});

const movieSchema = mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    genre: {
        name: String,
        description: String,
        wikipediaLink: {
            type: String, 
            required: true
        }
    },
    director: {
        name: String,
        bio: String,
        birthYear: Number,
        deathYear: Number,
        imdbLink: {
            type: String,
            required: true
        }
    },
    image: String,
    imdbLinks: String,
    featured: Boolean,
    rating: Number,
    releaseYear: Number,
    birthYear: Number,
    deathYear: String,
    stars: [
        {
            _id: false,
            character: String,
            actor: {
                type: String,
                required: true
            }
        }
    ]
});

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    birthDate: Date,
    favoriteActors: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Actor'
        }
    ],
    favoriteMovies: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    ],
    toWatchMovies: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    ]
});

/******** Methods/Statics ********/

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

/********** Models ***********/
  
const Actor = mongoose.model('Actor', actorSchema);
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

/********** Exports **********/

module.exports.Actor = Actor;
module.exports.Movie = Movie;
module.exports.User = User;