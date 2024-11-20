import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import * as path from 'path'
import { createServer } from './server.js'
import Fastify from 'fastify'
import prismaPlugin from './plugins/prisma'

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>

const options: AppOptions = {
  options: {},
}

const fastify = createServer()
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
const __dirname = path.dirname(__filename)

void fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'plugins'),
  options,
  forceESM: true,
})

// This loads all plugins defined in routes
// define your routes in one of these
void fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'routes'),
  options,
  forceESM: true,
})

const app = Fastify({
  logger: true,
})

async function start() {
  try {
    // Register prisma first
    await app.register(prismaPlugin)
    // Register other plugins after

    await app.listen({ port: 3000 })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
