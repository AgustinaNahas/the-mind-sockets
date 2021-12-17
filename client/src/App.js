import React, {useState, useEffect, useContext } from "react";
import Card from "./Card";
import Socket from "./Socket";
import {SocketContext} from "./SocketContext";
import View from "./View";

function App() {

    return (
        <Socket>
            <View/>
        </Socket>
    );
}

export default App;