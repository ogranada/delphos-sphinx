import { Request, Response } from 'express'
import { v1 as uuidv1 } from 'uuid'
import { IRequestAction, IRoom, IAnswer, AnswerStatus } from './data-interfaces'
import { join } from 'path'

let PUBLIC_PATH = join(__dirname, 'public')
if (process.env.ENV && process.env.ENV.toLowerCase() === 'development') {
  console.log('Running with environment', process.env.ENV)
  PUBLIC_PATH = join(process.cwd(), 'public')
}

function makeJSONAPIAnswer(data?: any, errors?: any): IAnswer {
  return {
    jsonapi: {
      version: '1.0',
    },
    data,
    errors,
  } as IAnswer
}

export const definitions = [
  {
    method: 'get',
    path: '/api',
    action(req: Request, res: Response) {
      res.json({ status: 'OK' })
    },
  } as IRequestAction,
  {
    method: 'post',
    path: '/api/rooms',
    action(req: Request, res: Response) {
      const room: IRoom = req.body as IRoom
      if (!room.name || !room.password || !room.key) {
        return res.status(406).json(
          makeJSONAPIAnswer(undefined, [
            {
              status: AnswerStatus.failure,
              message: 'missing field',
            },
          ])
        )
      }
      room.id = uuidv1()
      console.log(this.rooms)
      const roomsCount: number = Object.keys(this.rooms).reduce(
        (acc: Array<any>, roomId: string) => {
          if (this.rooms[roomId].name == room.name) {
            acc.push(room)
          }
          return acc
        },
        []
      ).length
      if (roomsCount > 0) {
        return res.status(406).json(
          makeJSONAPIAnswer(undefined, [
            {
              status: AnswerStatus.failure,
              message: 'invalid room name',
            },
          ])
        )
      }
      this.rooms[room.id] = room
      res.json(
        makeJSONAPIAnswer({
          status: AnswerStatus.success,
          room: {
            id: room.id,
            name: room.name,
          },
        })
      )
    },
  } as IRequestAction,
  {
    method: 'get',
    path: '/api/rooms',
    action(req: Request, res: Response) {
      const rooms = Object.keys(this.rooms).reduce(
        (acc: any, roomName: string) => {
          const room: IRoom = this.rooms[roomName]
          acc[roomName] = {
            id: room.id,
            name: room.name,
          }
          return acc
        },
        {}
      )
      res.json({ status: 'OK', rooms })
    },
  } as IRequestAction,
  {
    method: 'get',
    path: '/api/rooms/:room_id',
    action(req: Request, res: Response) {
      if (this.rooms[req.params.room_id]) {
        const room: IRoom = this.rooms[req.params.room_id]
        res.json({ status: 'OK', room: { name: room.name, id: room.id } })
      }
      res.json({ status: 'OK', message: 'room does not exists' })
    },
  } as IRequestAction,
  {
    method: 'delete',
    path: '/api/rooms/:room_id',
    action(req: Request, res: Response) {
      if (this.rooms[req.params.room_id]) {
        delete this.rooms[req.params.room_id]
        res.json({ status: 'OK' })
      }
      res.json({ status: 'OK', message: 'room does not exists' })
    },
  } as IRequestAction,
  {
    method: 'get',
    path: '/public/:path',
    action(req: Request, res: Response) {
      res.sendFile(join(PUBLIC_PATH, req.params.path))
    },
  } as IRequestAction,
  {
    method: 'get',
    path: '*',
    action(req: Request, res: Response) {
      res.sendFile(join(PUBLIC_PATH, 'index.html'))
    },
  } as IRequestAction,
]
