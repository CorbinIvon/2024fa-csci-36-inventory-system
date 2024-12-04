const { createServer } = require('http')
const { createYoga } = require('graphql-yoga')
const schema = require('./schema')

const yoga = createYoga({ schema })
const server = createServer(yoga)

const isTestMode = process.argv.includes('--test')

server.listen(4000, () => {
  console.log('Server running at http://localhost:4000/graphql')
  if (isTestMode) {
    console.log('Test mode: Server verified, shutting down')
    server.close(() => process.exit(0))
  }
})
