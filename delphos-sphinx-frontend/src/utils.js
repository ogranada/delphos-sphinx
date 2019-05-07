import { EventEmitter } from "events";

export function prepareWebSocket() {
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  const connection = new WebSocket("ws://127.0.0.1:5000");
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
