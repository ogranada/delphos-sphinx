import { Server } from 'server'
import { Router } from 'express'
import { IRequestAction } from 'data-interfaces'
import { server } from 'websocket'

export class PathsManager {
  server: Server
  requestActions: IRequestAction[]
  router: any

  constructor(requestActions: Array<IRequestAction>) {
    this.requestActions = requestActions
    this.router = Router()
  }

  setServer(server: Server) {
    this.server = server
  }

  preparePaths() {
    if (this.server) {
      this.requestActions.map((requestAction: IRequestAction) => {
        const { method, path, action } = requestAction
        this.router[method](path, action.bind(this.server))
        // this.router[method](path, action)
        console.log(`${method.toUpperCase()}\t::\t${path}`)
      })
      this.server.expressServer.use('', this.router)
    }
  }
}
