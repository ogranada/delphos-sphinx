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

export interface ICode {
  html: string
  css: string
  js: string
}

export interface IRoomDefinition {
  room_name: string
  password: string
  key: string
  code: ICode
}

export interface ISubscription {
  room: string
  name: string
  password: string
}

export interface IScriptFile {
  content: string
  path: string
}

export interface IBackendScripts {
  room: string
  name: string
  password: string
  files: Array<IScriptFile>
  main: string
}

export interface IUpdate extends ISubscription {
  html: string
  css: string
  js: string
}

///////////////// NEW INTERFACES /////////////////

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

export interface IRoom {
  id: string
  name: string
  password: string
  key: string
}

export interface IRoomConnectionContaner {
  room: IRoom
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
