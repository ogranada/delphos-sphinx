;(function() {
  function prepareWebSocket(params) {
    window.WebSocket = window.WebSocket || window.MozWebSocket
    const connection = new WebSocket('ws://127.0.0.1:5000')

    connection.onopen = function() {
      // connection is opened and ready to use
      console.log('connection opened')
    }

    connection.onerror = function(error) {
      // an error occurred when sending/receiving data
      console.error(error)
    }

    connection.onmessage = function(message) {
      // try to decode json (I assume that each message
      // from server is json)
      try {
        var json = JSON.parse(message.data)
        console.log(json)
      } catch (e) {
        console.log("This doesn't look like a valid JSON: ", message.data)
        return
      }
      // handle incoming message
    }

    window.wsConnection = connection
  }

  function prepareHandlers() {
    document
      .querySelector('#resetConnection')
      .addEventListener('click', event => {
        if (window.wsConnection) {
          window.wsConnection.close()
        }
        prepareWebSocket()
      })

    document
      .querySelector('.btnCreateRoom')
      .addEventListener('click', event => {
        // event.target.setAttribute('disabled', true)
        // document.querySelector('.btnSubscribe').textContent = 'subscribed'
        console.log('subscribed')
        wsConnection.send(
          JSON.stringify({
            type: 'create_room',
            body: {
              room_name: document.querySelector('#roomName').value,
              password: document.querySelector('#roomPassword').value,
              key: document.querySelector('#roomKey').value,
            },
          })
        )
      })

    document.querySelector('.btnSubscribe').addEventListener('click', event => {
      // event.target.setAttribute('disabled', true)
      // document.querySelector('.btnSubscribe').textContent = 'subscribed'
      console.log('subscribed')
      wsConnection.send(
        JSON.stringify({
          type: 'subscribe',
          body: {
            room: document.querySelector('#sRoomName').value,
            name: document.querySelector('#userName').value,
            password: document.querySelector('#password').value,
          },
        })
      )
    })

    document.querySelector('.btnBroadcast').addEventListener('click', event => {
      // event.target.setAttribute('disabled', true)
      console.log('Broadcast sent')
      wsConnection.send(
        JSON.stringify({
          type: 'update',
          body: {
            room: document.querySelector('#bcastRoom').value,
            password: document.querySelector('#bcastPassword').value,
            html: document.querySelector('#bcastHTML').value,
            css: document.querySelector('#bcastCSS').value,
            javascript: document.querySelector('#bcastJS').value,
          },
        })
      )
    })
  }

  function main() {
    prepareWebSocket()
    prepareHandlers()
  }

  main()
})()
