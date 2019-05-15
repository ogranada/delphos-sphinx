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
      }
    }
  }

  subscribe(message: IMessage, connection: connection) {
    const targetRoom: IRoom = this.server.getRoomById(message.room)
    if (targetRoom && targetRoom.password != message.payload.password) {
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
      const usersWithName = targetRoom.connections.filter((conn:ICustomer) => conn.name == name);
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
          }, 1000);
        } else {
          connContainer.id = message.payload.id;
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
              name
            },
            code: targetRoom.code
          },
        })
      )
    }
  }
}
