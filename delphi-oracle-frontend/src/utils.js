import { EventEmitter } from 'events';
import { store } from './store';

const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export function setCursorLocations(cursors) {
  store.commit('update_cursors', cursors);
}

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

export function prepareListenUpdates(action) {
  if (window.wsConnection) {
    window.wsConnection.answers.on('update_code', info => {
      setCursorLocations(info.payload.cursors);
      const code = atob(info.payload.code);
      const language = info.payload.language;
      action && action(language, code, info);
    });
  }
}

export function prepareListenRunCode(action) {
  if (window.wsConnection) {
    window.wsConnection.answers.on('run_code', info => {
      setCursorLocations(info.payload.cursors);
      action && action(info);
    });
  } else {
    prepareWebSocket().then(() => {
      prepareListenRunCode(action);
    });
  }
}

export function sendRunCodeMessage(room, userId, userName) {
  if (window.wsConnection) {
    window.wsConnection.send(
      JSON.stringify({
        type: 'run_code',
        room,
        payload: { source: userId, name: userName },
      }),
    );
  }
}

export function sendEcho(room) {
  if (window.wsConnection) {
    window.wsConnection.send(
      JSON.stringify({
        type: 'echo',
        room,
        payload: {},
      }),
    );
  }
}

export function prepareWebSocket() {
  return new Promise((resolve, reject) => {
    if (window.wsConnection) {
      const ivK = setInterval(() => {
        if (window.wsConnection.readyState) {
          clearInterval(ivK);
          resolve(window.wsConnection);
        }
      }, 100);
      return ivK;
    }
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    const wsAddress = getDataServer(true);
    const connection = new WebSocket(wsAddress);
    connection.answers = new EventEmitter();

    connection.onopen = function() {
      // connection is opened and ready to use
      window.console.log('Connection opened.');
      const ivK = setInterval(() => {
        if (window.wsConnection && window.wsConnection.readyState) {
          window.console.log('Connection ready.');
          clearInterval(ivK);
          resolve(window.wsConnection);
        }
      }, 100);
    };

    connection.onclose = function() {
      window.console.log('Connection closed.');
      window.wsConnection = undefined;
      resolve(null);
    };

    connection.onerror = function(error) {
      // an error occurred when sending/receiving data
      window.console.error(error);
      window.wsConnection = undefined;
      reject(new Error('conection closed'));
    };

    connection.onmessage = function(message) {
      try {
        const json = JSON.parse(message.data);
        connection.answers.emit(json.type, json);
      } catch (e) {
        window.console.log(
          'Failure processing message:\n\t%s\n\t%s',
          message.data,
          e.message,
        );
      }
    };
    window.wsConnection = connection;
  });
}

const updateCode = throttle((language, code, room, source, position) => {
  if (window.wsConnection) {
    window.wsConnection.send(
      JSON.stringify({
        type: 'update_code',
        room,
        payload: {
          language,
          code: btoa(code),
          source,
          position,
        },
      }),
    );
  }
}, 140); // 45 WpMin / 60 Secs / 10Char ~> 0.014 ~> 140ms

export function updateHTML(html, room, source, position) {
  updateCode('html', html, room, source, position);
}

export function updateCSS(css, room, source, position) {
  updateCode('css', css, room, source, position);
}

export function updateJavascript(js, room, source, position) {
  updateCode('js', js, room, source, position);
}

export function wsSubscribe(room, userName, roomPassword, userId) {
  return new Promise((resolve, reject) => {
    if (window.wsConnection && window.wsConnection.readyState) {
      try {
        window.wsConnection.answers.on('subscribe', info => {
          if (info.payload.status == 'success') {
            resolve(info);
          } else {
            reject(info);
          }
        });
        const subsMessage = JSON.stringify({
          type: 'subscribe',
          room: room,
          payload: {
            id: userId,
            name: userName,
            password: roomPassword,
          },
        });
        window.wsConnection.send(subsMessage);
      } catch (error) {
        window.console.error(error);
      }
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
