import { Server } from './server'
import { PathsManager } from './paths-manager'
import { definitions } from './path-definitions'

function main() {
  const pathsManager = new PathsManager(definitions)
  const server: Server = new Server({
    port: 5000,
    pathsManager,
  })
  server.start()
}

main()
