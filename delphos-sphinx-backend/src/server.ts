import { Server as HttpServer, createServer } from 'http'
import { join } from 'path'
import { tmpdir } from 'os'
import { existsSync, mkdirSync } from 'fs'
import { spawn } from 'child_process'
import { server as WsServer, IStringified, connection } from 'websocket'
import * as express from 'express'
import { getInterfaces } from './utils'
import {
  IServerConfig,
  ISubscription,
  IUpdate,
  IRoomDefinition,
  IBackendScripts,
  IScriptFile,
  ICode,
} from 'data-interfaces'
import { writeFileSync } from 'fs'

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
          console.log(
            '\n\nProcessing:\n',
            JSON.stringify(parsedMessage, null, 2)
          )

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
            roomDefinition.code = {
              html: '',
              css: '',
              js: '',
            }
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
          } else if (parsedMessage.type === 'run_in_be') {
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
            const beMessage: IBackendScripts = parsedMessage.body
            let strout: string = ''
            let strerr: string = ''
            const baseDir: string = join(
              tmpdir(),
              `execution_${beMessage.room}`
            )
            if (!existsSync(baseDir)) {
              mkdirSync(baseDir)
            }
            beMessage.files.forEach((file: IScriptFile) => {
              writeFileSync(join(baseDir, file.path), file.content)
            })
            const executionProcess = spawn(`node`, [beMessage.main], {
              cwd: baseDir,
            })

            executionProcess.stdout.on('data', data => {
              strout += `${data}`
            })

            executionProcess.stderr.on('data', data => {
              strerr += `${data}`
            })

            executionProcess.on('close', (code: number) => {
              connection.send(
                JSON.stringify({
                  type: parsedMessage.type,
                  status: code != 0 ? 'fail' : 'success',
                  message: `child process exited with code ${code}`,
                  stdio: {
                    out: strout,
                    err: strerr,
                  },
                })
              )
            })
          } else if (parsedMessage.type === 'get_room_info') {
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
            connection.send(
              JSON.stringify({
                type: parsedMessage.type,
                status: 'success',
                message: 'subscribed',
                code: (me.rooms_info as any)[room].code,
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
                name: subscription.name,
                room,
              })
            )
          } else if (parsedMessage.type === 'update') {
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
            const name: string = subscription.name
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
                console.log('sending update to', name, room.name)
                if (name != room.name) {
                  room.connection.send(
                    JSON.stringify({
                      type: parsedMessage.type,
                      status: 'success',
                      ...parsedMessage.body,
                    })
                  )
                }
                ;(me.rooms_info as any)[subscription.room].code = {
                  html: parsedMessage.body.html,
                  css: parsedMessage.body.css,
                  js: parsedMessage.body.js,
                } as ICode
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
