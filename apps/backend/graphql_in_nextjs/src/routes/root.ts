import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      return { root: true }
    } catch (error) {
      reply.status(503)
      return { root: false, error: error }
    }
  })
}

export default root
