import fp from 'fastify-plugin'
import fastifySwagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
// TODO: Implement docs
export default fp<FastifyDynamicSwaggerOptions>(async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Node Tree API',
        description: 'An API for managing hierarchical node structures',
        version: '0.1.0',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_RECIPESTACKER_API_URL || 'http://127.0.0.1:3001',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
        },
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here',
      },
    },
  })
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
})
