import { EventEmitter } from 'events';

export function getDataServer(websocket) {
  const storedInfo = localStorage.getItem('DELPHI_WS_SERVER');
  if (websocket) {
    return `${
      location.protocol.startsWith('https') ? 'wss' : 'ws'
    }://${storedInfo || window.location.host}`;
  } else {
    return `${
      location.protocol.startsWith('https') ? 'https' : 'http'
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
    window.console.log('Connection opened');
  };

  connection.onclose = function() {
    window.console.log('Connection closed.');
    window.wsConnection = undefined;
  };

  connection.onerror = function(error) {
    // an error occurred when sending/receiving data
    window.console.error(error);
    window.wsConnection = undefined;
  };

  connection.onmessage = function(message) {
    try {
      const json = JSON.parse(message.data);
      connection.answers.emit(json.type, json);
    } catch (e) {
      window.console.log("This doesn't look like a valid JSON: ", message.data);
      return;
    }
  };

  window.wsConnection = connection;
}

export function updateHTML() {
  window.console.log('update html');
  if (window.wsConnection) {
    window.console.log('start upd');
  }
}

export function updateCSS() {
  window.console.log('update css');
  if (window.wsConnection) {
    window.console.log('start upd');
  }
}

export function updateJavascript() {
  window.console.log('update js');
  if (window.wsConnection) {
    window.console.log('start upd');
  }
}

export function wsSubscribe(room, userName, roomPassword, userId) {
  return new Promise((resolve, reject) => {
    if (window.wsConnection) {
      window.wsConnection.answers.on('subscribe', info => {
        if (info.payload.status == 'success') {
          resolve(info);
        } else {
          reject(info);
        }
      });
      window.wsConnection.send(
        JSON.stringify({
          type: 'subscribe',
          room: room,
          payload: {
            id: userId,
            name: userName,
            password: roomPassword
          }
        })
      );
    } else {
      prepareWebSocket();
      setTimeout(() => {
        wsSubscribe(room, userName, roomPassword, userId)
          .then(answer => resolve(answer))
          .catch(answer => reject(answer));
      }, 1000);
    }
  });
}

export function reconnect(room, id, user, password) {
  return wsSubscribe(room, user, password, id);
}
