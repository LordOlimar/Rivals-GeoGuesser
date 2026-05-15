const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const strict = require("assert/strict");
const app = express();
require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const portNumber = 5000;

//MongoDB Schemas
const cluesSchema = new mongoose.Schema({
    src: String,
    map: String,
    x: Number,
    y: Number
});
const Clue = mongoose.model("Clue", cluesSchema);
const playersSchema = new mongoose.Schema({
    name: String,
    score: Number
});
const Player = mongoose.model("Player", playersSchema);

app.use(express.static(__dirname + "/files"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "files"));

const router = express.Router();
app.use(router);

router.get('/', async (req, res, next) => {
    res.render('index.ejs');
});

router.get("/play", async (req, res) => {
    let clues;
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        clues = await Clue.aggregate([{ $sample: { size: 5}}])
    } catch (err) {
        console.error(err);
    }
    res.render('play.ejs', { cluesrc: clues[0].src, mapsrc: clues[0].map, x: clues[0].x.toFixed(3), y: clues[0].y.toFixed(3) });
});

router.get("/leader", async (req, res) => {
    const table = new Table();
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        let players = await Player.find().sort( { "score": -1 } );
        players.forEach(element => {
            table.addRow(element.name, element.score);
        });
    } catch (err) {
        console.error(err);
    }
    
    res.render('leader.ejs', { leaderBoard: table.getTable() });
});

router.post("/leader", async (req, res) => {
    let {name, score} = req.body;
    const table = new Table();
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        const player = new Player({
            name: name,
            score: parseInt(score)
        });
        await player.save();

        let players = await Player.find().sort( { "score": -1 } );
        players.forEach(element => {
            table.addRow(element.name, element.score);
        });
    } catch (err) {
        console.error(err);
    }
    
    res.render('leader.ejs', { leaderBoard: table.getTable() });
});

class Table {
    #table;
    constructor() {
        this.#table = `<table>
            <tr>
                <th>Name</th>
                <th>Score</th>
            </tr>
            `;
    }

    addRow(name, score) {
        this.#table += `<tr>
                <td>${name}</td>
                <td>${score}</td>
            </tr>
            `;
    }

    getTable() {
        this.#table += `</table>`;
        return this.#table;
    }
}