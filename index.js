const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Import the router
const router = require('./router/general');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Use the router for all routes starting with '/'
app.use('/', router);

// Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000 🚀`);
});