// Modules
const express = require('express'),
morgan = require('morgan');

const app = express();

const movies = [
    {
        id: 1,   
        description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
        directors: ['James Cameron'],
        genres: [
            'Action',
            'Adventure', 
            'Fantasy', 
            'Sci-Fi'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BMTYwOTEwNjAzMl5BMl5BanBnXkFtZTcwODc5MTUwMw@@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt0499549/',
        name: 'Avatar'
    },
    {
        id: 2,   
        description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
        directors: ['James Cameron'],
        genres: [
            'Drama',
            'Romance'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt0120338/',
        name: 'Titanic'
    },
    {
        id: 3,   
        description: 'In 2035, a technophobic cop investigates a crime that may have been perpetrated by a robot, which leads to a larger threat to humanity.',
        directors: ['Alex Proyas'],
        genres: [
            'Action',
            'Drama',
            'Sci-Fi',
            'Thriller'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BNmE1OWI2ZGItMDUyOS00MmU5LWE0MzUtYTQ0YzA1YTE5MGYxXkEyXkFqcGdeQXVyMDM5ODIyNw@@._V1_UY268_CR8,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt0343818/',
        name: 'I, Robot'
    },
    {
        id: 4,   
        description: 'A band director recruits a Harlem street drummer to play at a Southern university.',
        directors: ['Charles Stone III'],
        genres: [
            'Comedy',
            'Drama',
            'Romance',
            'Music'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BNzhhY2Y3NDktM2JiYi00YmY0LWEzOGQtMDc4Yzk3ZWIxOTVmXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt0303933/',
        name: 'Drumline'
    },
    {
        id: 5,   
        description: 'Four teenagers are sucked into a magical video game, and the only way they can escape is to work together to finish the game.',
        directors: ['Jake Kasdan'],
        genres: [
            'Action',
            'Adventure',
            'Comedy',
            'Fantasy'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BODQ0NDhjYWItYTMxZi00NTk2LWIzNDEtOWZiYWYxZjc2MTgxXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt2283362/',
        name: 'Jumanji: Welcome to the Jungle'
    },
    {
        id: 6,   
        description: 'After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
        directors: [
            'Anthony Russo',
            'Joe Russo'
        ],
        genres: [
            'Action', 
            'Adventure',
            'Drama',
            'Sci-Fi'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt4154796/',
        name: 'Avengers: End Game'
    },
    {
        id: 7,   
        description: 'The African monarch Akeem learns he has a long-lost son in the United States and must return to America to meet this unexpected heir and build a relationship with his son.',
        directors: ['Craig Brewer'],
        genres: ['Comedy'],
        image: 'https://m.media-amazon.com/images/M/MV5BZTMyY2Q2MDctMDFlMS00MWEzLTk1NmEtNDcxNzg1ZGJlNGU5XkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt6802400/',
        name: 'Coming 2 America'
    },
    {
        id: 8,   
        description: 'Beca, a freshman at Barden University, is cajoled into joining The Bellas, her school\'s all-girls singing group. Injecting some much needed energy into their repertoire, The Bellas take on their male rivals in a campus competition.',
        directors: ['Jason Moore'],
        genres: [
            'Comedy',
            'Music',
            'Romance'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BMTcyMTMzNzE5N15BMl5BanBnXkFtZTcwNzg5NjM5Nw@@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt1981677/',
        name: 'Pitch Perfect'
    },
    {
        id: 9,   
        description: 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy\'s room.',
        directors: ['John Lasseter'],
        genres: [
            'Animation',
            'Adventure',
            'Comedy', 
            'Family',
            'Fantasy'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BMDU2ZWJlMjktMTRhMy00ZTA5LWEzNDgtYmNmZTEwZTViZWJkXkEyXkFqcGdeQXVyNDQ2OTk4MzI@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt0114709/',
        name: 'Toy Story'
    },
    {
        id: 10,   
        description: 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
        directors: [
            'Roger Allers', 
            'Rob Minkoff'
        ],
        genres: [
            'Animation',
            'Adventure',
            'Drama',
            'Family', 
            'Musical'
        ],
        image: 'https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_UX182_CR0,0,182,268_AL_.jpg',
        imdbLink: 'https://www.imdb.com/title/tt0110357/',
        name: 'The Lion King'
    }
];

// Middlewares
app.use(morgan('common')); // log requests
app.use(express.static('public')); // serve static files in public folder
// Error handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.sendStatus(500).send('An error has ocurred!');
});

// Routes
app.get('/',(req, res) => {
    res.send('Welcome to the Movies API');
});

app.get('/movies',(req, res) => {
    res.json(movies);
});

app.get('/movies/:id',(req, res) => {
    // Filter through movies array and find movie requested by id
    res.json(movies.filter((movie) => {
        return movie.id == req.params.id;
    })[0]);
});

app.listen(8080);