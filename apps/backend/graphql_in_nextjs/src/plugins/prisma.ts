// src/plugins/prisma.ts
import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'

// Declare types for Fastify decorator
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const prisma = new PrismaClient()

    await prisma.$connect()

    // Decorate fastify instance with prisma client
    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async () => {
      await prisma.$disconnect()
    })
  },
  { name: 'prisma' },
)

export default prismaPlugin
