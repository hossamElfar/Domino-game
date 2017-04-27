var Deque = require("double-ended-queue");
const uuidV4 = require('uuid/v4');
module.exports = {

   /* Create the dominos cards */
    createDominos: function(cb) {
        var returned = [];
        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 7; j++) {
                var tile = {
                    "front": i,
                    "back": j,
                    "uuid": uuidV4()
                }
                returned.push(tile)
            }
        }
        cb(returned);
    },

    /* Initialize a new game instance  */
    initGame: function(cb) {
        var players = [];
        this.createDominos((dominos) => {
            for (var i = 0; i < 4; i++) {
                dominos = dominos.sort(function() {
                    return 0.5 - Math.random()
                });
                if (i != 3) {
                    var playerTiles = [];
                    for (var j = 0; j < 7; j++) {
                        playerTiles.push(dominos[j]);
                        dominos.splice(j, 1);
                    }
                    var player = {
                        "name": "computer " + (i + 1),
                        "tiles": playerTiles
                    }
                    players.push(player);
                } else {
                    var playerTiles = [];
                    for (var j = 0; j < 7; j++) {
                        playerTiles.push(dominos[j]);
                        dominos.splice(j, 1);
                    }
                    var player = {
                        "name": "you",
                        "tiles": playerTiles
                    }
                    players.push(player);
                }

            }
            var game = {
                "players": players,
                "remaining_tile": dominos,
                "board": [],
                "turn": players[0]
            }
            cb(game);
        });

    },

    /* Play a tile  */
    play: function(tile, game, cb) {
        var board = game.game.board;
        var player = game.game.turn;
        var deque = new Deque();
        deque.push(board);
        if (board.length == 0) {
            deque.push(tile);
            var updated_board = deque.toArray()[1];
            game.game.board.push(updated_board);
            var player_tiles = player.tiles;
            player_tiles.forEach((tile_p) => {
                if (tile_p.uuid == tile.uuid) {
                    var index = player_tiles.indexOf(tile_p.uuid);
                    player_tiles.splice(index, 1);
                }
            })
            var next_player = this.next(player, game);
            game.game.turn = next_player;
            cb(game, false, true)
        } else {
            var front = deque.peekFront();
            var back = deque.peekBack();
            if (front[0].front == tile.front || front[0].front == tile.back) {
              var player_tiles = player.tiles;
              player_tiles.forEach((tile_p) => {
                  if (tile_p.uuid == tile.uuid) {
                      var index = player_tiles.indexOf(tile_p.uuid);
                      player_tiles.splice(index, 1);
                  }
              })
                deque.unshift(tile);
                console.log(deque.toArray());
                var updated_board = deque.toArray()[0];

                game.game.board.push(updated_board);
                var winner = this.isWinner(player);
                var next_player = this.next(player, game);
                game.game.turn = next_player;
                cb(game, winner, true)
            } else {
                if (back[0].back == tile.front || back[0].back == tile.back) {
                    var updated_board = deque.toArray()[0][0];
                    var player_tiles = player.tiles;
                    player_tiles.forEach((tile_p) => {
                        if (tile_p.uuid == tile.uuid) {
                            var index = player_tiles.indexOf(tile_p.uuid);
                            player_tiles.splice(index, 1);
                        }
                    })
                    game.game.board.push(updated_board);
                    var winner = this.isWinner(player);
                    var next_player = this.next(player, game);
                    game.game.turn = next_player;
                    cb(game, winner, true)
                } else {
                    var next_player = this.next(player, game);
                    game.game.turn = next_player;
                    cb(game, false, false);
                }
            }
        }
    },

    /* Check if a player can play or not */
    canPlay: function(tiles, game, cb) {
        var board = game.game.board;
        var deque = new Deque();
        deque.push(board);
        var flag = false;
        tiles.forEach((tile) => {
            if (board.length == 0) {
                deque.push(tile);
                var updated_board = deque.toArray()[1];
                game.game.board.push(updated_board);
                flag = true;
                cb(true);


            } else {
                var front = deque.peekFront();
                var back = deque.peekBack();
                if (front[0].front == tile.front || front[0].front == tile.back) {
                    deque.shift(tile);
                    var updated_board = deque.toArray()[0][0];
                    game.game.board.push(updated_board);
                    flag = true;
                    cb(true);

                } else {
                    if (back[0].back == tile.front || back[0].back == tile.back) {
                        var updated_board = deque.toArray()[0][0];
                        game.game.board.push(updated_board);
                        flag = true;
                        cb(true);

                    }
                }
            }
        })
        cb(flag);
    },

    /* Check if the player is winner or not */
    isWinner: function(player) {
        if (player.tiles.length == 0) {
            return true;
        } else {
            return false;
        }
    },

    /* Chaniging the turns after a player played */
    next: function(player, game) {
        var players = game.game.players;
        var index = -1
        if (player.name.includes("1")) {
            index = 1;
        }
        if (player.name.includes("2")) {
            index = 2;
        }
        if (player.name.includes("3")) {
            index = 3;
        }
        if (player.name.includes("you")) {
            index = 0;
        }
        return players[index];
    }

}
