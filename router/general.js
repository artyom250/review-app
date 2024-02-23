const express = require('express');
const router = express.Router();
const userModel = require("../mongodb/users");
const gameModel = require("../mongodb/games");
const session = require('express-session');

// Use the session middleware
router.use(session({
    secret: 'artyomagadzhanyan250',
    resave: false,
    saveUninitialized: true
}));

// Define your signin route here
router.get("/", function (req, res) {
    res.render("index");
});

router.post("/", async function (req, res) {
    try {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username, password });
        if (user) {
            req.session.username = username; // Store the username in the session
            res.redirect(`/home?username=${username}`);
        } else {
            return res.send(`
                <script>
                    window.alert("Invalid username or password!");
                    window.location.href = "/";
                </script>
            `);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error signing in");
    }
});

// Define your signup route here
router.get("/signup", function (req, res) {
    res.render("signup");
});

router.post("/signup", async function (req, res) {
    try {
        const { username, password } = req.body;
        
        // Check if the username already exists in the database
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.send(`
                <script>
                    window.alert("Username already exists!");
                    window.location.href = "/signup";
                </script>
            `);
        }
        
        // If the username doesn't exist, create a new user
        const user = await userModel.create({ username, password });
        
        // Display an alert message for successful signup
        return res.send(`
            <script>
                window.alert("Sign up successful!");
                window.location.href = "/";
            </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error signing up");
    }
});

// Define your logout route here
router.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send("Error logging out");
        } else {
            res.redirect("/");
        }
    });
});

// Define your home route here
router.get("/home", function (req, res) {
    const username = req.query.username || req.session.username; // Use session username if available
    gameModel.find().then(function(games) {
        res.render("home", { 
            username,
            games: games
        });
    }).catch(error => console.log(error));
});

// Define your review route here
router.get("/reviews/:id", async function (req, res) {
    try {
        const username = req.session.username;
        const game = await gameModel.findById(req.params.id);
        if (!game) {
            return res.status(404).send("Game not found");
        }
        res.render("reviews", { game, username });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting game details");
    }
});

router.post("/reviews/:id", async function (req, res) {
    try {
        const { reviewId } = req.body;
        const username = req.session.username;
        const game = await gameModel.findById(req.params.id);
        
        if (!game) {
            return res.status(404).send("Game not found");
        }
        
        // Add the review to the game document
        const { review } = req.body;
        game.reviews.push({ username, review });
        
        await game.save();
        
        // Redirect the user back to the reviews page
        res.redirect(`/reviews/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
});

// Define your delete review route here
router.post("/reviews/:id/delete", async function (req, res) {
    try {
        const { reviewId } = req.body;
        const game = await gameModel.findById(req.params.id);
        
        if (!game) {
            return res.status(404).send("Game not found");
        }
        
        // Find the index of the review with the given ID
        const reviewIndex = game.reviews.findIndex(review => review._id == reviewId);
        
        // Remove the review from the array
        game.reviews.splice(reviewIndex, 1);
        
        await game.save();
        
        // Redirect the user back to the reviews page
        res.redirect(`/reviews/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
});

module.exports = router;