import { Server as HttpServer, createServer } from 'http'
import { join } from 'path'
import { server as WsServer, IStringified, connection } from 'websocket'
import * as express from 'express'
import { getInterfaces } from './utils'
import {
  IServerConfig,
  ISubscription,
  IUpdate,
  IRoomDefinition,
} from 'data-interfaces'

export class Server {
  port: number
  server: HttpServer
  webSocketServer: WsServer
  expressServer: express.Express
  rooms: Object
  rooms_info: Object
  keys: string[]

  constructor(config: IServerConfig = { port: 5000 }) {
    this.port = config.port
    this.expressServer = express()
    this.expressServer.use(express.static(join(__dirname, 'public')))
    this.keys = config.keys
    console.error(
      `\nValid room creation keys:\n\t· ${this.keys.join(`\n\t· `)}\n`
    )
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
    this.rooms_info = {}
  }

  prepareWebSocketServer() {
    const me = this
    me.webSocketServer.on('request', request => {
      console.log(`connection from customer ${request.origin}`)
      const connection: connection = request.accept(null, request.origin)

      // This is the most important callback for us, we'll handle
      // all messages from users here.
      connection.on('message', message => {
        if (message.type === 'utf8') {
          const parsedMessage = JSON.parse(message.utf8Data)
          console.log(JSON.stringify(parsedMessage, null, 2))

          if (parsedMessage.type === 'create_room') {
            if (!me.keys.includes(parsedMessage.body.key)) {
              return connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid key',
                })
              )
            }
            const roomDefinition: IRoomDefinition = parsedMessage.body as IRoomDefinition
            if ((me.rooms as any)[roomDefinition.room_name]) {
              return connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid room name',
                })
              )
            }
            ;(me.rooms_info as any)[roomDefinition.room_name] = roomDefinition
            ;(me.rooms as any)[roomDefinition.room_name] = []
            connection.send(
              JSON.stringify({
                type: parsedMessage.type,
                status: 'success',
                message: 'room created successfuly',
              })
            )
          } else if (parsedMessage.type === 'subscribe') {
            const room: string = parsedMessage.body.room
            const password: string = parsedMessage.body.password
            const _room: any = (me.rooms_info as any)[room]
            if (!room || !_room) {
              return connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid room name',
                })
              )
            }
            if (_room.password !== password) {
              return connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid password',
                })
              )
            }
            const subscription: ISubscription = parsedMessage.body as ISubscription
            if (!(me.rooms as any)[subscription.room]) {
              Object.assign(me.rooms, { [subscription.room]: [] })
            }
            ;(me.rooms as any)[subscription.room].push({
              connection,
              name: subscription.name,
            })
            connection.send(
              JSON.stringify({
                type: parsedMessage.type,
                status: 'success',
                message: 'subscribed',
              })
            )
          } else if (parsedMessage.type === 'update') {
            const room: string = parsedMessage.body.room
            const password: string = parsedMessage.body.password
            if (!room) {
              return connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid room name',
                })
              )
            }
            if ((me.rooms_info as any)[room].password !== password) {
              return connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid password',
                })
              )
            }
            const subscription: IUpdate = parsedMessage.body as IUpdate
            if (!subscription.room) {
              connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: 'fail',
                  message: 'Invalid room name',
                })
              )
            }
            if ((me.rooms as any)[subscription.room]) {
              ;(me.rooms as any)[subscription.room].forEach((room: any) => {
                room.connection.send(JSON.stringify(parsedMessage.body))
              })
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
        console.log(`\nListening at:`)
        Object.values(getInterfaces()).map(ip => {
          console.log(`\t· http://${ip}:${this.port}/`)
        })
        console.log(`\t· http://localhost:${this.port}/`)
      })
    }
  }
}
