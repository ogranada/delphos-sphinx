
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
wsConnection.send(
          JSON.stringify({
            type: 'create_room',
            body: {
              room_name: 'room1',
              password: 'passwd',
              key: 'admin',
            },
          })
        )
// update code in a room
connection.send(JSON.stringify({type:'update', body:{html: '<a>hello</a>', css: '.a { color:red; }', javascript: 'console.log(1)', room:'001'}}))

// be execution using node

const files = [
    {
        content: 'console.log("super file")',
        path: 'demo.js'
    }
]

const saveFiles = {
  type:'run_in_be',
  body:{
    room:'room1', 
    name: 'oscar', 
    password: 'x', 
    files: files,
    main: 'demo.js'
  }
}

wsConnection.send(JSON.stringify(saveFiles))

// get_room_info
wsConnection.send(JSON.stringify({type:'get_room_info', body:{password:'admin',room:'room1'}}))

```
