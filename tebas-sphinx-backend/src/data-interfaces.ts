import { PathsManager } from 'paths-manager'

export interface IRequestAction {
  path: string
  method: string
  action: Function
}

export interface IServerConfig {
  port: number
  pathsManager?: PathsManager
}

export interface ISubscription {
  room: string
  name: string
}

export interface IUpdate extends ISubscription {
  html: string
  css: string
  js: string
}
