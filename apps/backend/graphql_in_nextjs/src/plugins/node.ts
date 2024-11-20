import fp from 'fastify-plugin'
import { NodeService } from '../services/NodeService.js'
import FP_PRISMA from './prisma.js'

export const FP_NODE_SERVICE = 'nodeService'

declare module 'fastify' {
  export interface FastifyInstance {
    nodeService: NodeService
  }
}

export default fp(async (fastify) => {
  const nodeServiceInstance = new NodeService({
    logger: fastify.log,
    prisma: fastify.prisma,
  })
  fastify.decorate(FP_NODE_SERVICE, nodeServiceInstance)
})
