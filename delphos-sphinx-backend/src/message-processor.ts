import { Server } from './server'
import { IRoomConnectionContaner } from 'data-interfaces'
import { connection } from 'websocket'

export class MessageProcessor {
  server: Server
  roomConnections: Array<IRoomConnectionContaner>
  constructor(server: Server) {
    this.server = server
    this.roomConnections = []
  }

  process(message: any) {
    if (message.type === 'utf8') {
      const parsedMessage = JSON.parse(message.utf8Data)
      console.log('\n\nProcessing:\n', JSON.stringify(parsedMessage, null, 2))
      console.log(this.server.rooms)
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
