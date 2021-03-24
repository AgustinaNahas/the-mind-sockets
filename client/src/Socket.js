import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";

function Socket({events}) {
    useEffect(() => {
        var socket = socketIOClient(ENDPOINT);

        for(const key in events){
            socket.on(key, data => {
                events[key](data)
            });
        }

        return () => socket.disconnect();

    });

    return (
        <div></div>
    );
}

export default Socket;