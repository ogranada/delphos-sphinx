import { EventEmitter } from "events";

export function getDataServer(websocket) {
  const storedInfo = localStorage.getItem("DELPHI_WS_SERVER");
  if (websocket) {
    return `${
      location.protocol.startsWith("https") ? "wss" : "ws"
    }://${storedInfo || window.location.host}`;
  } else {
    return `${
      location.protocol.startsWith("https") ? "https" : "http"
    }://${storedInfo || window.location.host}`;
  }
}

export function prepareWebSocket() {
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  const wsAddress = getDataServer(true);
  const connection = new WebSocket(wsAddress);
  connection.answers = new EventEmitter();

  connection.onopen = function() {
    // connection is opened and ready to use
    window.console.log("connection opened");
  };

  connection.onclose = function() {
    window.console.log("Connection closed.");
  };

  connection.onerror = function(error) {
    // an error occurred when sending/receiving data
    window.console.error(error);
  };

  connection.onmessage = function(message) {
    // try to decode json (I assume that each message
    // from server is json)
    try {
      const json = JSON.parse(message.data);
      window.console.log(json);
      connection.answers.emit(json.type, json);
    } catch (e) {
      window.console.log("This doesn't look like a valid JSON: ", message.data);
      return;
    }
    // handle incoming message
  };

  window.wsConnection = connection;
}

export function wsSubscribe(roomName, userName, roomPassword) {
  if (window.wsConnection) {
    window.wsConnection.answers.on("subscribe", info => {
      window.wsConnected = info.status === "success";
    });
    window.wsConnection.send(
      JSON.stringify({
        type: "subscribe",
        body: {
          room: roomName,
          name: userName,
          password: roomPassword
        }
      })
    );
  } else {
    prepareWebSocket();
    setTimeout(() => {
      wsSubscribe(roomName, userName, roomPassword);
    }, 1000);
  }
}
