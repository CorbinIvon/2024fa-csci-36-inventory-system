require('dotenv').config({ path: '../../.env' })
const { createServer } = require('http')
const { createYoga } = require('graphql-yoga')
const schema = require('./schema')

const yoga = createYoga({ schema })
const server = createServer(yoga)

const isTestMode = process.argv.includes('--test')
const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 4000

server.listen(GRAPHQL_PORT, () => {
  console.log(`Server running at http://localhost:${GRAPHQL_PORT}/graphql`)
  if (isTestMode) {
    console.log('Test mode: Server verified, shutting down')
    server.close(() => process.exit(0))
  }
})
