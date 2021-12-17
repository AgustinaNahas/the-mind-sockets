import React, {useEffect, useState} from "react";
import socketIOClient from "socket.io-client";
import {SocketContext} from "./SocketContext";

function Socket({events, children}) {

    const ENDPOINT = "http://192.168.1.18:4001";

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!socket){
            var s = socketIOClient(ENDPOINT);
            setSocket(s)

            for(const key in events){
                s.on(key, data => {
                    events[key](s, data)
                });
            }
        }
    });

    useEffect(() => {
        if (socket) return () => socket.disconnect();
    }, [socket]);

    return socket ?
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
            : <div></div>;
}

export default Socket;