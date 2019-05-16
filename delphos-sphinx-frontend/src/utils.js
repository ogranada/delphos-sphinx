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

export function prepareListenUpdates(action) {
  if (window.wsConnection) {
    window.wsConnection.answers.on("update_code", info => {
      action && action(info);
    });
  }
}

export function prepareWebSocket() {
  return new Promise((resolve, reject) => {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    const wsAddress = getDataServer(true);
    const connection = new WebSocket(wsAddress);
    connection.answers = new EventEmitter();

    connection.onopen = function() {
      // connection is opened and ready to use
      window.console.log("Connection opened.");
      resolve(connection);
    };

    connection.onclose = function() {
      window.console.log("Connection closed.");
      window.wsConnection = undefined;
      resolve(null);
    };

    connection.onerror = function(error) {
      // an error occurred when sending/receiving data
      window.console.error(error);
      window.wsConnection = undefined;
      reject(new Error("conection closed"));
    };

    connection.onmessage = function(message) {
      try {
        const json = JSON.parse(message.data);
        connection.answers.emit(json.type, json);
      } catch (e) {
        window.console.log(
          "This doesn't look like a valid JSON: ",
          message.data
        );
        return;
      }
    };
    window.wsConnection = connection;
  });
}

export function updateHTML(html, room, source) {
  if (window.wsConnection) {
    window.wsConnection.send(
      JSON.stringify({
        type: "update_code",
        room,
        payload: {
          language: "html",
          code: btoa(html),
          source
        }
      })
    );
  }
}

export function updateCSS(css, room, source) {
  if (window.wsConnection) {
    window.wsConnection.send(
      JSON.stringify({
        type: "update_code",
        room,
        payload: {
          language: "css",
          code: btoa(css),
          source
        }
      })
    );
  }
}

export function updateJavascript(js, room, source) {
  if (window.wsConnection) {
    window.wsConnection.send(
      JSON.stringify({
        type: "update_code",
        room,
        payload: {
          language: "js",
          code: btoa(js),
          source
        }
      })
    );
  }
}

export function wsSubscribe(room, userName, roomPassword, userId) {
  return new Promise((resolve, reject) => {
    if (window.wsConnection) {
      window.wsConnection.answers.on("subscribe", info => {
        if (info.payload.status == "success") {
          resolve(info);
        } else {
          reject(info);
        }
      });
      const subsMessage = JSON.stringify({
        type: "subscribe",
        room: room,
        payload: {
          id: userId,
          name: userName,
          password: roomPassword
        }
      });
      window.wsConnection.send(subsMessage);
    } else {
      prepareWebSocket().then(() => {
        wsSubscribe(room, userName, roomPassword, userId)
          .then(answer => resolve(answer))
          .catch(answer => reject(answer));
      });
    }
  });
}

export function reconnect(room, id, user, password) {
  return wsSubscribe(room, user, password, id);
}
