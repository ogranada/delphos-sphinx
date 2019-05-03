import { Server } from './server'
import { PathsManager } from './paths-manager'
import { definitions } from './path-definitions'

function main() {
  const pathsManager = new PathsManager(definitions)
  let keys = ['admin']
  if (process.env.KEYS) {
    keys = process.env.KEYS.split(',').map((key: string) => key.trim())
  }
  const server: Server = new Server({
    port: parseInt(process.env.PORT) || 5000,
    pathsManager,
    keys,
  })
  server.start()
}

main()
