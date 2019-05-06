import { PathsManager } from 'paths-manager'

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

export interface IRoomDefinition {
  room_name: string
  password: string
  key: string
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
