
# Web Socket Test

```javascript
window.WebSocket = window.WebSocket || window.MozWebSocket;
var connection = new WebSocket('ws://127.0.0.1:5000');

connection.onopen = function () {
  // connection is opened and ready to use
  console.log('connection opened');
};

connection.onerror = function (error) {
  // an error occurred when sending/receiving data
  console.error(error);
};

connection.onmessage = function (message) {
// try to decode json (I assume that each message
// from server is json)
try {
  var json = JSON.parse(message.data);
  console.log(json)
} catch (e) {
  console.log('This doesn\'t look like a valid JSON: ',
    message.data);
  return;
}
// handle incoming message
};

// subscribe to room
connection.send(JSON.stringify({type:'subscribe', body:{room:'001', name: 'user 1'}}))
// update code in a room
connection.send(JSON.stringify({type:'update', body:{html: '', css: '', javascript: ''}}))
```
