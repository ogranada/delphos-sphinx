import { Server as HttpServer, createServer } from 'http'
import { server as WsServer, IStringified, connection } from 'websocket'
import * as express from 'express'
import {
  IServerConfig,
  IRequestAction,
  ISubscription,
  IUpdate,
} from 'data-interfaces'

export class Server {
  port: number
  server: HttpServer
  webSocketServer: WsServer
  expressServer: express.Express
  rooms: Object

  constructor(config: IServerConfig = { port: 5000 }) {
    this.port = config.port
    this.expressServer = express()
    this.server = createServer(this.expressServer)
    this.webSocketServer = new WsServer({
      httpServer: this.server,
    })
    this.prepareWebSocketServer()
    if (config.pathsManager) {
      config.pathsManager.setServer(this)
      config.pathsManager.preparePaths()
    }
    this.rooms = {}
  }

  prepareWebSocketServer() {
    this.webSocketServer.on('request', request => {
      console.log(`connection from customer ${request.origin}`)
      const connection: connection = request.accept(null, request.origin)

      // This is the most important callback for us, we'll handle
      // all messages from users here.
      connection.on('message', message => {
        if (message.type === 'utf8') {
          const parsedMessage = JSON.parse(message.utf8Data)
          if (parsedMessage.type === 'subscribe') {
            const subscription: ISubscription = parsedMessage.body as ISubscription
            if (!(this.rooms as any)[subscription.room]) {
              Object.assign(this.rooms, { [subscription.room]: [] })
            }
            ;(this.rooms as any)[subscription.room].push({
              connection,
              name: subscription.name,
            })
            connection.send(
              JSON.stringify({
                type: parsedMessage.type,
                result: 'subscribed',
              })
            )
          } else if (parsedMessage.type === 'update') {
            const subscription: IUpdate = parsedMessage.body as IUpdate
            if ((this.rooms as any)[subscription.room]) {
              ;(this.rooms as any)[subscription.room].forEach(
                (/*connection*/) => {
                  // TODO: do broadcast in room
                }
              )
            }
          }
        }
      })

      connection.on('close', function(connection) {
        // close user connection
      })
    })
  }

  start(): void {
    if (this.server) {
      this.server.listen(this.port, () => {
        console.log(`Listening at ${this.port}`)
      })
    }
  }
}
