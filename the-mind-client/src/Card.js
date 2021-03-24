import React, {useState} from "react";

function Card({card, play, small, nulled, played}) {

    return (
        <div style={{ cursor: small || nulled ? "initial" : "pointer",
            display: played ? "none" : "block",
            width: 'fit-content',
            opacity: nulled ? "0.5" : "1",
            position: 'relative', flexShrink: '1', height: small ? 150 : 300}} onClick={(e) => {
                if (!nulled){
                    play(e);
                }
            }}>
            <img src={"card.jpg"} style={{ maxHeight: "100%", minWidth: '100%' }}/>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 36 : 72, position: 'absolute', top: "50%", left: "50%", marginTop: small ? -5 : -10,
                transform: 'translateX(-50%) translateY(-50%)' }}>{card}</p>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 12 : 24, position: 'absolute', top: "0%", left: "0%", marginTop: 0,
                color: 'white', margin: 10 }}>{card}</p>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 12 : 24, position: 'absolute', top: "0%", right: "0%", marginTop: 0,
                color: 'white', margin: 10 }}>{card}</p>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 12 : 24, position: 'absolute', bottom: "0%", right: "0%", marginTop: 0,
                color: 'white', margin: 10 }}>{card}</p>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 12 : 24, position: 'absolute', bottom: "0%", left: "0%", marginTop: 0,
                color: 'white', margin: 10 }}>{card}</p>
        </div>

    );
}

export default Card;