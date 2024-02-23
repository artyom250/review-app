const mongoose = require("./connect");

const gameSchema = mongoose.Schema({
    type: String,
    banner: String,
    title: String,
    devs: String,
    reviews: Array
});

const gameModel = mongoose.model("games", gameSchema);

module.exports = gameModel;