import React, {useState, useEffect} from "react";
import socketIOClient from "socket.io-client";
import Card from "./Card";

const ENDPOINT = "http://localhost:4001";




function App() {
    const [matchId, setMatchId] = useState("");
    const [matchSet, setMatchSet] = useState(false);
    const [socket, setSocket] = useState(null);
    const [cards, setCards] = useState([]);
    const [cardsPlayed, setCardsPlayed] = useState(0);
    const [cardPlayed, setCardPlayed] = useState(null);
    const [nulled, setNulled] = useState([]);

    let trueCards;
    let truePlayedCard;



    function newMatch(){
        socket.emit("new");
    }

    function start(matchId){
        socket.emit("start", matchId);
    }

    function nulledCardsBy(card){
        var nulledCards = [];

        const cartas = cards.length > 0 ? cards : trueCards;
        console.log("PLAYED INSIDE " + cardPlayed)

        for(var i=0; i<cartas.length;i++){
            if (cartas[i].number < card && !cartas[i].played && !nulled.includes(cartas[i].number)) {
                nulledCards.push(cartas[i].number)
            }
        }

        if (nulledCards.length > 0){
            var finished = (cardsPlayed+1+nulledCards.length  === cards.length);

            console.log("nulled ", nulledCards.join(","))

            setNulled([...nulled, ...nulledCards])

            socket.emit("nulled", {cards: nulledCards, finished: finished});
        }
    }


    function joinMatch(){
        socket.emit("join", matchId);
        setMatchSet(true);
    }

    function playCard(card){
        var finished = (cardsPlayed+1 === cards.length);

        setCardPlayed(card);
        nulledCardsBy(card, cards);

        cards.find((aCard) => {
            return aCard.number === card;
        }).played = true;

        setCardsPlayed(cardsPlayed+1)

        socket.emit("play", {card: card, finished: finished});

    }



    useEffect(() => {
        if (socket){
            socket.on("new", data => {
                setMatchSet(true);
                setMatchId(data);
            });
            socket.on("cards", data => {

                var cards = data.map((card) => {
                    return {number: card, played: false}
                })

                setCards(cards);
                trueCards = cards;

                setCardsPlayed(0)
                console.log(data)
            });
            socket.on("play", card => {
                console.log("HAVE " + cardPlayed )
                // console.log(socket, cards, cardsPlayed, cardPlayed, nulled)
                console.log("PLAYED " + card )
                if (cardPlayed != card) {
                    setCardPlayed(card);
                    nulledCardsBy(card, cards);
                }

            });
            socket.on("next", () => {
                setCards([]);
                trueCards = [];
                setCardsPlayed(0);
                setCardPlayed(null);
            });
            // socket.on("nulled", ([...cards]) => {
            //     setNulled([...nulled, ...cards]);
            // });
            socket.on("over", () => {
                console.log("PERDISTE ZOPENCO")
            });
        } else {
            var s = socketIOClient(ENDPOINT);
            setSocket(s);
        }

    }, [socket, cards, cardsPlayed, cardPlayed, nulled]);

    useEffect(() => {
        if (socket)
            return () => socket.disconnect();
    }, []);

    return (
        <div>
            <div style={{ display: cards.length > 0 ? "none" : "flex" }}>
                <input type="text" value={matchSet ? matchId : ''} />
                <button onClick={() => { newMatch() }}> New </button>
            </div>
            <div style={{ display: matchSet ? "none" : "flex" }}>
                <input type="text" onChange={(e) => {setMatchId(e.target.value)}}/>
                <button onClick={() => { joinMatch() }}> Join </button>
            </div>
            <button style={{ display: cards.length > 0 ? "none" : "block" }} onClick={() => { start(matchId) }}> Start </button>
            <div style={{ display: cards.length > 0 ? "block" : "none"  }}>
                <div style={{ width: 97, height:  150, background: "dimgrey", margin: '0 auto'}}>
                    {cardPlayed &&
                        <Card small card={cardPlayed}/>
                    }
                </div>

                <div style={{ display: 'flex', justifyContent: "space-evenly", flexWrap: 'wrap' }}>
                { cards && cards.map(({number, played}) =>
                    <Card card={number} nulled={number < cardPlayed} played={played} cursor={"pointer"} play={() => { playCard(number) }}/>
                ) }
                </div>
            </div>
        </div>


    );
}

export default App;