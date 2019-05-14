import { Server } from './server'
import { IRoomConnectionContaner, IMessage, ICustomer } from './data-interfaces'
import { v1 as uuidv1 } from 'uuid'
import { connection } from 'websocket'

export class MessageProcessor {
  server: Server
  roomConnections: Array<IRoomConnectionContaner>
  constructor(server: Server) {
    this.server = server
    this.roomConnections = []
  }

  process(connection: connection, message: any) {
    console.log(this.roomConnections)

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
    // console.log('-->', message.room)
    // console.log('-->', this.server.rooms as any)
    // console.log('-->', (this.server.rooms as any)[message.room])

    const rooms: IRoomConnectionContaner[] = this.roomConnections.filter(
      (roomConnection: IRoomConnectionContaner) =>
        roomConnection.room.id == message.room
    )
    console.log(1)
    if (rooms.length > 0) {
      console.log(2)
      const room: IRoomConnectionContaner = rooms[0]
      if (room.room.password === message.payload.password) {
        console.log(3)
        room.connections.push(<ICustomer>{
          id: uuidv1(),
          name: message.payload.name,
          connection,
        })
        console.log(4)
        connection.send(<IMessage>{
          type: message.type,
          room: message.room,
          payload: {
            status: 'success',
            message: 'subscription successfull',
            code: 'xxx',
          },
        })
      } else {
        connection.send(<IMessage>{
          type: message.type,
          room: message.room,
          payload: {
            status: 'failure',
            message: 'invalid password',
          },
        })
      }
    }
  }
}
