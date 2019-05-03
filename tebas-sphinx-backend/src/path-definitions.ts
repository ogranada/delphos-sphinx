import { Request, Response } from 'express'
import { IRequestAction } from 'data-interfaces'
import { join } from 'path'

export const definitions = [
  {
    method: 'get',
    path: '/api',
    action(req: Request, res: Response) {
      res.json({ status: 'OK' })
    },
  } as IRequestAction,
  {
    method: 'get',
    path: '/api/rooms',
    action(req: Request, res: Response) {
      const rooms = Object.keys(this.rooms).reduce((acc: any, roomName) => {
        acc[roomName] = this.rooms[roomName].map((room: any) => room.name)
        return acc
      }, {})
      res.json({ status: 'OK', rooms })
    },
  } as IRequestAction,
  {
    method: 'get',
    path: '*',
    action(req: Request, res: Response) {
      res.sendFile(join(__dirname, 'public', 'index.html'))
    },
  } as IRequestAction,
]
