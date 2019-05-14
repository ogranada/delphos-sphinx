import { Server } from './server'
import { IRoomConnectionContaner, IMessage } from './data-interfaces'
import { connection } from 'websocket'

export class MessageProcessor {
  server: Server
  roomConnections: Array<IRoomConnectionContaner>
  constructor(server: Server) {
    this.server = server
    this.roomConnections = []
  }

  process (message: any) {
    if (message.type === 'utf8') {
      const parsedMessage: IMessage = JSON.parse(message.utf8Data)
      console.log('\n\nProcessing:\n', JSON.stringify(parsedMessage, null, 2))
      console.log('->', this);
      switch(parsedMessage.type) {
        case 'subscribe':
          // this.subscribe(parse)
          break;
      }
    }
  }

  subscribe(room: string, connection: connection) {
    const rooms: IRoomConnectionContaner[] = this.roomConnections.filter(
      (roomConnection: IRoomConnectionContaner) =>
        roomConnection.room.id == room
    )
    if (rooms.length > 0) {
      const room: IRoomConnectionContaner = rooms[0]
      room.connections.push(connection)
    }
  }
}
