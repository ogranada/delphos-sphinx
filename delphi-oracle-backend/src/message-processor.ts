import { Server } from './server'
import { IMessage, ICustomer, IRoom } from './data-interfaces'
import { v1 as uuidv1 } from 'uuid'
import { connection } from 'websocket'

export class MessageProcessor {
  server: Server
  cursorLocations: any
  constructor(server: Server) {
    this.server = server
    this.cursorLocations = {} as any
  }

  process(connection: connection, message: any) {
    if (message.type === 'utf8') {
      const parsedMessage: IMessage = JSON.parse(message.utf8Data)
      global.console.log(
        '\n\nProcessing:\n',
        JSON.stringify(parsedMessage, null, 2)
      )
      if (!parsedMessage.room) {
        connection.send(
          JSON.stringify(<IMessage>{
            type: message.type,
            room: message.room,
            payload: {
              status: 'failure',
              message: 'invalid room',
            },
          })
        )
        return setTimeout(() => {
          connection.close()
        }, 1000)
      }
      switch (parsedMessage.type) {
        case 'subscribe':
          this.subscribe(parsedMessage, connection)
          break
        case 'update_code':
          this.updateCode(parsedMessage, connection)
          break
        case 'run_code':
          this.resendRunCode(parsedMessage, connection)
          break
      }
    }
  }

  resendRunCode(message: IMessage, connection: connection) {
    const targetRoom: IRoom = this.server.getRoomById(message.room)
    if (!this.cursorLocations[targetRoom.id]) {
      this.cursorLocations[targetRoom.id] = {} as any
    }
    targetRoom.connections
      .filter((customer: ICustomer) => customer.id != message.payload.source)
      .forEach((customer: ICustomer) => {
        global.console.log(
          'Resending to customer',
          customer.name,
          '->',
          customer.id
        )
        this.cursorLocations[targetRoom.id][customer.id] = {
          position: message.payload.position,
          name: customer.name,
          language: message.payload.language,
        }
        global.console.log('~~>', JSON.stringify(this.cursorLocations, null, 2))
        customer.connection.send(
          JSON.stringify(<IMessage>{
            type: message.type,
            room: message.room,
            payload: {
              ...{ ...message.payload, position: undefined },
              cursors: this.cursorLocations[targetRoom.id],
            },
          })
        )
      })
  }

  updateCode(message: IMessage, connection: connection) {
    const targetRoom: IRoom = this.server.getRoomById(message.room)
    if (!this.cursorLocations[targetRoom.id]) {
      this.cursorLocations[targetRoom.id] = {} as any
    }
    if (
      (targetRoom.code as any)[message.payload.language] ===
      message.payload.code
    ) {
      return
    }
    Object.assign(targetRoom.code, {
      [message.payload.language]: message.payload.code,
    })
    let sourceCustomer: ICustomer = targetRoom.connections.filter(
      (customer: ICustomer) => customer.id === message.payload.source
    )[0]
    const others = targetRoom.connections.filter(
      (customer: ICustomer) => customer.id !== sourceCustomer.id
    )

    this.cursorLocations[targetRoom.id][sourceCustomer.id] = {
      position: message.payload.position,
      name: sourceCustomer.name,
      language: message.payload.language,
    }

    others.forEach((customer: ICustomer) => {
      customer.connection.send(
        JSON.stringify(<IMessage>{
          type: message.type,
          room: message.room,
          payload: {
            ...{ ...message.payload, position: undefined },
            cursors: this.cursorLocations[targetRoom.id],
            writer: sourceCustomer ? sourceCustomer.name : 'undefined',
          },
        })
      )
    })
  }

  subscribe(message: IMessage, connection: connection) {
    const targetRoom: IRoom = this.server.getRoomById(message.room)
    if (!targetRoom) {
      connection.send(
        JSON.stringify(<IMessage>{
          type: message.type,
          room: message.room,
          payload: {
            status: 'failure',
            message: 'invalid password',
          },
        })
      )
      return setTimeout(() => {
        connection.close()
      }, 1000)
    }
    if (targetRoom.password != message.payload.password) {
      connection.send(
        JSON.stringify(<IMessage>{
          type: message.type,
          room: message.room,
          payload: {
            status: 'failure',
            message: 'invalid password',
          },
        })
      )
      return setTimeout(() => {
        connection.close()
      }, 1000)
    } else {
      const id: string = uuidv1()
      const name: string = message.payload.name
      const connContainer: ICustomer = <ICustomer>{
        id,
        name,
        connection,
      }
      const usersWithName = targetRoom.connections.filter(
        (conn: ICustomer) => conn.name == name
      )
      if (usersWithName.length > 0) {
        if (message.payload.id != usersWithName[0].id) {
          connection.send(
            JSON.stringify(<IMessage>{
              type: message.type,
              room: message.room,
              payload: {
                status: 'failure',
                message: 'invalid user name',
              },
            })
          )
          return setTimeout(() => {
            connection.close()
          }, 1000)
        } else {
          usersWithName[0].connection = connection
          return connection.send(
            JSON.stringify(<IMessage>{
              type: message.type,
              room: message.room,
              payload: {
                status: 'success',
                message: 'rejoined to room',
                position: message.payload.position,
                user: {
                  id: message.payload.id,
                  name,
                },
                code: targetRoom.code,
              },
            })
          )
        }
      }
      targetRoom.connections.push(connContainer)
      connection.send(
        JSON.stringify(<IMessage>{
          type: message.type,
          room: message.room,
          payload: {
            status: 'success',
            message: 'joined to room',
            position: message.payload.position,
            user: {
              id,
              name,
            },
            code: targetRoom.code,
          },
        })
      )
    }
  }
}
