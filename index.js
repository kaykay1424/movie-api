// Modules
const express = require('express'),
morgan = require('morgan'),
uuid = require('uuid');

const app = express();

// API Data
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
],
directors = [
    {
        bio: 
            `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla. 
            Donec pellentesque vel velit quis semper. 
            Duis rutrum purus justo. 
            Maecenas sit amet felis vel orci euismod dignissim vel eget nunc. Quisque ornare, velit eu volutpat vulputate, nisi felis pharetra nisi, sit amet dignissim nibh nibh rutrum nisl. 
            Ut ac libero suscipit, ultrices ante non, interdum erat. 
            Duis faucibus dictum sodales. 
            Duis dignissim mauris nec libero luctus imperdiet. 
            Mauris venenatis orci eget urna cursus porttitor. 
            Maecenas convallis blandit nulla, eget commodo libero tincidunt eu.
            `, 
        birth_year: 1970, 
        death_year: 'N/A',
        name: 'James Cameron',
    },
    {
        bio: 
            `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla. 
            Donec pellentesque vel velit quis semper. 
            Duis rutrum purus justo. 
            Maecenas sit amet felis vel orci euismod dignissim vel eget nunc. Quisque ornare, velit eu volutpat vulputate, nisi felis pharetra nisi, sit amet dignissim nibh nibh rutrum nisl. 
            Ut ac libero suscipit, ultrices ante non, interdum erat. 
            Duis faucibus dictum sodales. 
            Duis dignissim mauris nec libero luctus imperdiet. 
            Mauris venenatis orci eget urna cursus porttitor. 
            Maecenas convallis blandit nulla, eget commodo libero tincidunt eu.
            `, 
        birth_year: 1980, 
        death_year: 'N/A',
        name: 'Jason Moore'
    },
    {
        bio: 
            `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla. 
            Donec pellentesque vel velit quis semper. 
            Duis rutrum purus justo. 
            Maecenas sit amet felis vel orci euismod dignissim vel eget nunc. Quisque ornare, velit eu volutpat vulputate, nisi felis pharetra nisi, sit amet dignissim nibh nibh rutrum nisl. 
            Ut ac libero suscipit, ultrices ante non, interdum erat. 
            Duis faucibus dictum sodales. 
            Duis dignissim mauris nec libero luctus imperdiet. 
            Mauris venenatis orci eget urna cursus porttitor. 
            Maecenas convallis blandit nulla, eget commodo libero tincidunt eu.
            `, 
        birth_year: 1955, 
        death_year: 'N/A',
        name: 'Alex Proyas'
    }
],
genres = [
    {
        name: 'Action',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
    {
        name: 'Adventure',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
    {
        name: 'Comedy',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
    {
        name: 'Drama',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
    {
        name: 'Horror',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
    {
        name: 'Romance',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
    {
        name: 'Thriller',
        description: 'Aliquam vestibulum, quam vel commodo rhoncus, eros diam venenatis quam, sit amet volutpat mi quam quis nulla.'
    },
];
const users = [];

// Middlewares
app.use(express.json());
app.use(morgan('common')); // log requests
app.use(express.static('public')); // serve static files in public folder
// Error handler
app.use((err, req, res, next) => {
    res.sendStatus(500).send('An error has ocurred!');
});

// Routes

// Movies
app.get('/',(req, res) => {
    res.send('Welcome to the Movies API');
});

// Get a list of all movies by name
app.get('/movies',(req, res) => { 
    res.json(movies);    
});

// Get a single movie by name
app.get('/movies/:name',(req, res) => {
    res.json(movies.find((movie) => {
        return movie.name.toLowerCase().replace(/\s/,'') === req.params.name.toLowerCase().replace(/\s/,'');
    }));  
});

// Get all genres 
app.get('/genres',(req, res) => {
    res.json(genres);    
});

// Get a single genre by name
app.get('/genres/:name',(req, res) => {
    res.json(genres.find((genre) => {
        return genre.name.toLowerCase().replace(/\s/,'') === req.params.name.toLowerCase().replace(/\s/,'');
    }));   
});

// Get all directors by name
app.get('/directors',(req, res) => {
    res.json(directors);    
});

// Get a single director by name
app.get('/directors/:name',(req, res) => {
    res.json(directors.find((director) => {
        return director.name.toLowerCase().replace(/\s/,'') === req.params.name.toLowerCase().replace(/\s/,'');
    }));   
});

// Users

// Register a new user
app.post('/users', (req, res) => {
    // Check if both email and username were passed in request
    if (!req.body.email || !req.body.username) {
        res.status(400).send('Please include an email and a username to register a new user.');        
    }

    // Check if user with that email already exists
    const existingUser = users.find((user) => user.email === req.body.email);
    if (existingUser) res.status(400).send('Sorry, a user with that email address already exists. Please use another email address.');
    
    const newUser = req.body
    newUser['id'] = uuid.v4(); // create unique user id
    newUser['favorites'] = [];
    users.push(newUser);
    res.status(201).send(newUser);
});

// Deregister a user
app.delete('/users/:id', (req, res) => {
    const id = req.body.id;
    let index; // index of user in users array

    // Check if user exists and find index of user
    const user = users.find((user,i) => {
        if (user.id === id) {
            index = i;
            return true;
        }
    });

    if (!user) res.status(400).send('Sorry, that user doesn\'t exist.');
    users.splice(index,1);
    res.status(200).send(`${user.email} has been removed.`);
});

// Update user's username
app.patch('/users/:id/username', (req, res) => {
    const id = req.params.id;   
    // Check if user exists
    const user = users.find((user) => user.id === id);
    if (!user) res.status(400).send('Sorry, that user doesn\'t exist.');     
    
    user.username = req.body.username;
    res.status(201).send(user);
});

// Add a movie to user's favorites list
app.patch('/users/:id/favorites/:name', (req, res) => {
    const id = req.params.id;
    const movie = req.body.movie;
    // Check if user exists
    const user = users.find((user) => user.id === id);
    if (!user) res.status(400).send('Sorry, that user doesn\'t exist.');
    // Check if movie is in user's favorites list
    if (user.favorites.indexOf(movie) > -1) res.status(400).send('That movie is already in your favorites list. Try adding another one.');
    
    user.favorites.push(movie); 
    res.status(201).send(`${movie} has been added.`)
});

// Remove a movie from user's favorites list
app.delete('/users/:id/favorites/:name', (req, res) => {
    const id = req.params.id;
    const movie = req.body.movie;    
    // Check if user exists
    const user = users.find((user) => user.id === id);
    if (!user) res.status(400).send('Sorry, that user doesn\'t exist.');
    // Check if movie is in user's favorites list
    if (user.favorites.indexOf(movie) < 0) res.status(400).send('That movie is not in your favorites list. Try removing another one.');
    
    user.favorites.splice(user.favorites.indexOf(movie), 1);
    res.status(200).send(`${movie} has been removed.`);
});

app.listen(8080);