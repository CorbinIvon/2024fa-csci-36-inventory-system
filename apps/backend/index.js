const { createServer } = require('http');
const { createYoga } = require('graphql-yoga');
const schema = require('./schema');

const yoga = createYoga({ schema });
const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Server running at http://localhost:4000/graphql');
});

