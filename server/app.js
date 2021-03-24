const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let matches = [];

function dealCards(cards, turn, players){
    for (var j=0; j<=players.length-1;j++ ){
        var playerCards = [];
        console.log("player " + players[j])

        for (var i=0; i<turn+1;i++){
            var randomCard = Math.floor(Math.random() * 100);
            console.log(randomCard + " -> " + cards[randomCard])

            while (!cards[randomCard]){
                randomCard = Math.floor(Math.random() * 100);
                console.log(randomCard + " -> " + cards[randomCard])
            }

            playerCards.push(randomCard);
            cards[randomCard] = false;
        }

        io.to(players[j]).emit("cards", playerCards);
    }
}

io.on("connection", (socket) => {
    console.log("Nuevo jugador - id " + socket.id);

    var matchId;

    socket.on("new", () => {
        matchId = makeid(10);

        var cards = Array.from({length: 100}, (_, i) => true)

        matches.push({code: matchId, turn: 0, playersFinished: 0, cards: cards, nulled: [], players: [socket.id]})

        socket.emit("new", matchId)

        console.log("new " + socket.id)
        console.log(matches)
    });

    socket.on("start", () => {
        var match = matches.find((a) => {return a.code === matchId})

        if (match.turn === 0) match.lives = match.players.length;
        console.log("lives: " + match.lives)

        var turn = match.turn
        var players = match.players
        var cards = match.cards

        dealCards(cards, turn, players)

        console.log("new " + socket.id)
        // console.log(matches)
    });

    socket.on("nulled", ({cards: cards, finished: finished}) => {
        var match = matches.find((a) => {return a.code === matchId})
        if (finished) match.playersFinished +=1;

        var lives = match.lives

        match.lives = lives - cards.length;

        console.log("lives: " + match.lives)

        io.emit("nulled", cards);

        if (match.lives < 0){
            io.emit("over")
        }

        console.log("nulled " + cards.join(","))
        // console.log(matches)
    });

    socket.on("play", ({card, finished}) => {
        var match = matches.find((a) => {return a.code === matchId})
        if (finished) match.playersFinished +=1;

        socket.broadcast.emit("play", card)

        if (match.players.length == match.playersFinished){
            match.turn += 1;
            match.playersFinished = 0;
            match.nulled = [];
            io.emit("next")
        }

        console.log("play " + card + " by " + socket.id)
        // console.log(matches)
    });

    socket.on("join", (id) => {
        matchId = id;
        var match = matches.find((a) => {return a.code === id})

        var players = match.players
        players.push(socket.id)
        match.players = players;

        console.log("join " + socket.id)
        // console.log(matches)
    });

    socket.on("disconnect", () => {
        console.log("Jugador " + socket.id + " desconectado");
        var match = matches.findIndex((a) => {return a.players.some((p) => {return p === socket.id})})

        if (match == -1) return;

        var players = matches[match].players;
        var index = players.findIndex((p) => {return p === socket.id})

        players.splice(index, 1)

        if (players.length < 1){
            matches.splice(match, 1)
        } else {
            matches[match].players = players;
        }

        console.log("leave " + socket.id)
        // console.log(matches)
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));