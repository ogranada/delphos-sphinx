import { Server } from './server'
import { IMessage, ICustomer, IRoom } from './data-interfaces'
import { v1 as uuidv1 } from 'uuid'
import { connection } from 'websocket'

export class MessageProcessor {
  server: Server
  constructor(server: Server) {
    this.server = server
  }

  process(connection: connection, message: any) {
    if (message.type === 'utf8') {
      const parsedMessage: IMessage = JSON.parse(message.utf8Data)
      console.log('\n\nProcessing:\n', JSON.stringify(parsedMessage, null, 2))
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
    console.log(this.server.getRooms(), null, 2)
    const targetRoom: IRoom = this.server.getRoomById(message.room)
    targetRoom.connections
      .filter((customer: ICustomer) => customer.id != message.payload.source)
      .forEach((customer: ICustomer) => {
        global.console.log(
          'Resending to customer',
          customer.name,
          '->',
          customer.id
        )

        customer.connection.send(
          JSON.stringify(<IMessage>{
            type: message.type,
            room: message.room,
            payload: message.payload,
          })
        )
      })
  }

  updateCode(message: IMessage, connection: connection) {
    const targetRoom: IRoom = this.server.getRoomById(message.room)
    if (
      (targetRoom.code as any)[message.payload.language] ===
      message.payload.code
    ) {
      return
    }
    Object.assign(targetRoom.code, {
      [message.payload.language]: message.payload.code,
    })
    targetRoom.connections
      .filter((customer: ICustomer) => customer.id != message.payload.source)
      .forEach((customer: ICustomer) => {
        global.console.log(
          'Resending to customer',
          customer.name,
          '->',
          customer.id
        )

        customer.connection.send(
          JSON.stringify(<IMessage>{
            type: message.type,
            room: message.room,
            payload: {
              language: message.payload.language,
              code: message.payload.code,
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
            message: 'invalid room',
          },
        })
      )
      setTimeout(() => {
        connection.close()
      }, 1000)
    } else if (targetRoom.password != message.payload.password) {
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
      setTimeout(() => {
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
