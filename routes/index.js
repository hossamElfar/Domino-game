var express = require('express');
var router = express.Router();
var Board = require('../controllers/board.js');
var Deque = require("double-ended-queue");
var db = require('../db,js');
var ObjectId = require('mongodb').ObjectID;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});
/* Craete a new game instance  */
router.get('/create-board', (req, res) => {
    Board.initGame((data) => {
        db.connect((err, db) => {
            if (!err) {
                var collection = db.collection("games");
                // Insert a single document
                collection.insertOne({
                    "game": data
                }, (err, result) => {
                    collection.findOne({
                        "game": data
                    }, function(err, item) {
                      res.json(item);
                    })
                });
            }
        });

    });
});

/* Play a tile  */
router.post('/play/:id', (req, res) => {
    var id = req.params.id;
    var tile = req.body.tile;

    db.connect((err, db) => {
        if (!err) {
            var collection = db.collection("games");
            collection.findOne({
                "_id": new ObjectId(id)
            }, function(err, game) {
                Board.play(tile, game, (game_updated,winner,state) => {
                    if (state == true) {
                      collection.updateOne({"_id": new ObjectId(id)},game_updated);
                      if(winner){
                        res.json({'state':"winner !!!"});
                      }else{
                          res.json(game);
                      }
                    } else {
                        res.json({"state": "you cannot play"});
                    }
                })
            })

        }
    });
});

/* Check whether the player can play or not */
router.post('/canPlay/:id', (req, res) => {
    var id = req.params.id;
    var tiles = req.body.tiles;

    db.connect((err, db) => {
        if (!err) {
            var collection = db.collection("games");
            collection.findOne({
                "_id": new ObjectId(id)
            }, function(err, game) {
                Board.canPlay(tiles, game, (state) => {
                    if (state == true) {
                        res.json({"state": "you can play"});
                    } else {
                      res.json({"state": "you cannot play"});
                    }
                })
            })

        }
    });
});

module.exports = router;
