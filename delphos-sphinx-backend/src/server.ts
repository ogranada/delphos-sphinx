import { Server as HttpServer, createServer } from 'http'
import { join } from 'path'
import { server as WsServer, connection } from 'websocket'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { getInterfaces } from './utils'
import { MessageProcessor } from './message-processor'
import {
  IServerConfig,
  ISubscription,
  IUpdate,
  IRoomDefinition,
  IBackendScripts,
  IScriptFile,
  ICode,
} from 'data-interfaces'

export class Server {
  port: number
  server: HttpServer
  webSocketServer: WsServer
  expressServer: express.Express
  rooms: Object
  // rooms_info: Object
  keys: string[]
  messageProcessor: MessageProcessor

  constructor(config: IServerConfig = { port: 5000 }) {
    this.port = config.port
    this.expressServer = express()
    this.expressServer.use(cors())
    this.expressServer.use(bodyParser.urlencoded({ extended: false }))
    this.expressServer.use(bodyParser.json())
    this.expressServer.use(express.static(join(__dirname, 'public')))

    this.keys = config.keys
    console.error(
      `\nValid room creation keys:\n\t· ${this.keys.join(`\n\t· `)}\n`
    )
    this.server = createServer(this.expressServer)
    this.webSocketServer = new WsServer({
      httpServer: this.server,
    })
    this.messageProcessor = new MessageProcessor(this)
    this.prepareWebSocketServer()
    if (config.pathsManager) {
      config.pathsManager.setServer(this)
      config.pathsManager.preparePaths()
    }
    this.rooms = {}
  }

  prepareWebSocketServer() {
    const me = this
    me.webSocketServer.on('request', request => {
      console.log(`connection from customer ${request.origin}`)
      const connection: connection = request.accept(null, request.origin)

      // This is the most important callback for us, we'll handle
      // all messages from users here.
      connection.on('message', message => {
        console.log('processing ws message')

        this.messageProcessor.process(message)
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
