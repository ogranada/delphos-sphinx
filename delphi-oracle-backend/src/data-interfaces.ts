import { PathsManager } from 'paths-manager'
import { connection } from 'websocket'

export interface IRequestAction {
  path: string
  method: string
  action: Function
}

export interface IServerConfig {
  port: number
  pathsManager?: PathsManager
  keys?: Array<string>
}

export enum AnswerStatus {
  success = 'success',
  failure = 'failure',
}

export interface IAnswer {
  jsonapi: {
    version: string
  }
  data?: Array<any> | Object
  included?: Array<any> | Object
  errors?: Array<any> | Object
}

export interface ICode {
  html: string
  css: string
  js: string
}

export interface IRoom {
  id: string
  name: string
  password: string
  key: string
  code: ICode
  connections: Array<ICustomer>
}

export interface ICustomer {
  id: string
  name: string
  connection: connection
}

export interface IMessage {
  type: string
  room: string
  payload: any
}
