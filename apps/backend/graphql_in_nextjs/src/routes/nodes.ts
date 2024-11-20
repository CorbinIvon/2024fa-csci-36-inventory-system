import { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'

const NodeType = Type.Object({
  node_id: Type.String(),
  parent_id: Type.Optional(Type.String()),
  data: Type.Any(),
})

const CreateNodeType = Type.Object({
  parent_id: Type.Optional(Type.String()),
  data: Type.Any(),
})

const nodes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/nodes',
    {
      schema: {
        tags: ['Nodes'],
        response: {
          200: Type.Array(NodeType),
        },
      },
    },
    async (request, reply) => {
      return fastify.nodeService.getAllNodes()
    },
  )

  fastify.withTypeProvider<TypeBoxTypeProvider>().get(
    '/nodes/:id',
    {
      schema: {
        tags: ['Nodes'],
        response: {
          200: NodeType,
        },
      },
    },
    async (request: any, reply) => {
      const node = await fastify.nodeService.getNode(request.params.id)
      if (!node) return reply.notFound()
      return node
    },
  )

  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    '/nodes',
    {
      schema: {
        tags: ['Nodes'],
        body: CreateNodeType,
      },
    },
    async (request: any) => {
      return fastify.nodeService.createNode(request.body)
    },
  )

  fastify.withTypeProvider<TypeBoxTypeProvider>().put(
    '/nodes/:id/move',
    {
      schema: {
        tags: ['Nodes'],
        body: Type.Object({
          new_parent_id: Type.Optional(Type.String()),
        }),
      },
    },
    async (request: any) => {
      return fastify.nodeService.moveNode({
        node_id: request.params.id,
        new_parent_id: request.body.new_parent_id,
      })
    },
  )

  fastify.withTypeProvider<TypeBoxTypeProvider>().put(
    '/nodes/:id',
    {
      schema: {
        tags: ['Nodes'],
        body: Type.Object({
          data: Type.Any(),
        }),
      },
    },
    async (request: any) => {
      return fastify.nodeService.editNode(request.params.id, request.body.data)
    },
  )

  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    '/nodes/:id',
    {
      schema: {
        tags: ['Nodes'],
      },
    },
    async (request: any, reply) => {
      const success = await fastify.nodeService.deleteNode(request.params.id)
      if (!success) return reply.notFound()
      return { message: 'Node deleted successfully' }
    },
  )
}

export default nodes
