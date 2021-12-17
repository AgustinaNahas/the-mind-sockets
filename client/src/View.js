import React, {useState, useEffect, useContext, useCallback } from "react";
import Card from "./Card";
import {SocketContext} from "./SocketContext";

function View({}) {

    const [matchId, setMatchId] = useState("");
    const [matchSet, setMatchSet] = useState(false);
    const [cards, setCards] = useState([]);
    const [cardsPlayed, setCardsPlayed] = useState(0);
    const [cardPlayed, setCardPlayed] = useState(null);
    const [nulled, setNulled] = useState([]);

    const socket = useContext(SocketContext);

    function newMatch(){
        socket.emit("new");
    }

    function start(matchId){
        socket.emit("start", matchId);
    }

    function nulledCardsBy(card){
        var nulledCards = [];

        console.log("nulled")
        console.log(nulled)

        // Para cada carta, me fijo si es menor que la carta jugada,
        // si no fue jugada todavía
        // y si no está ya en el array de cartas anuladas

        console.log("cards")
        console.log(cards)

        for(var i=0; i<cards.length;i++){
            console.log(cards[i].number < card)
            console.log(!cards[i].played)
            console.log(!nulled.includes(cards[i].number))
            if (cards[i].number < card && !cards[i].played && !nulled.includes(cards[i].number)) {
                nulledCards.push(cards[i].number)
            }
        }

        // Si hay cartas nuevas anuladas, las mando
        if (nulledCards.length > 0){
            console.log("Lo tengo que mandar")
            var finished = (cardsPlayed+nulledCards.length  === cards.length);
            console.log(nulledCards, finished)

            setNulled([...nulled, ...nulledCards])

            socket.emit("nulled", {cards: nulledCards, finished: finished});
        }
    }

    function joinMatch(){
        socket.emit("join", matchId);
        setMatchSet(true);
    }

    function playCard(card){
        // Si terminó
        var finished = (cardsPlayed+1 === cards.length);

        // Se jugó una carta más
        setCardsPlayed(cardsPlayed+1)

        // Se jugó la carta
        setCardPlayed(card);

        // Pongo que ya se jugó esa carta
        var newCards = cards;

        newCards.find((aCard) => {
            return aCard.number === card;
        }).played = true;

        setCards(newCards);

        // Le aviso a todos lo que jugué
        socket.emit("play", {card: card, finished: finished});

        // Me fijo si esa carta me anuló alguna otra
        nulledCardsBy(card);


    }

    const socketNew = useCallback((data) => {
        setMatchSet(true);
        setMatchId(data);
    }, []);

    const socketCards = useCallback((data) => {
        var cards = data.map((card) => {
            return {number: card, played: false}
        })
        console.log("NUEVAS CARTAS")
        console.log(cards)

        setCards(cards);
        setCardsPlayed(0)

        console.log(data)
    }, [cards]);

    const socketPlay = useCallback((card) => {

        // Pongo que se jugó esa carta
        setCardPlayed(card);

        console.log("Jugada: " + card)

        console.log("Chequeo anuladas")
        console.log("Cards")
        console.log(cards)

        // Anulo el resto de las cartas
        nulledCardsBy(card);


    }, [cards]);

    const socketNulled = useCallback(([...nulledCards]) => {
        setNulled([...nulled, ...nulledCards]);
    }, [cards]);

    const socketNext = useCallback((data) => {
        setCards([]);
        setCardsPlayed(0);
        setCardPlayed(null);
    }, [cards]);

    const socketOver = useCallback((data) => {
        console.log("PREDISTE ZOPENCO")
    }, []);


    useEffect(() => {
        socket.on("new", socketNew);
        socket.on("cards", socketCards);
        socket.on("play", socketPlay);
        socket.on("nulled", socketNulled);
        socket.on("next", socketNext);
        socket.on("over", socketOver);
    }, [socket, socketNew, socketCards, socketPlay, socketNulled, socketNext, socketOver]);

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

export default View;