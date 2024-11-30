const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLBoolean, GraphQLSchema } = require('graphql')
const GraphQLJSON = require('graphql-type-json').default
const db = require('./db')

// NodePoint Type
const NodePointType = new GraphQLObjectType({
  name: 'NodePoint',
  fields: {
    id: { type: GraphQLInt },
    parent: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    data: { type: GraphQLJSON },
    version: { type: GraphQLInt },
    deleted: { type: GraphQLBoolean },
  },
})

// NodePointHistory Type
const NodePointHistoryType = new GraphQLObjectType({
  name: 'NodePointHistory',
  fields: {
    id: { type: GraphQLInt },
    nodePointId: { type: GraphQLInt },
    version: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    data: { type: GraphQLJSON },
    action: { type: GraphQLString },
    timestamp: { type: GraphQLString },
  },
})

// RootQuery
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    fetchAll: {
      type: new GraphQLList(NodePointType),
      async resolve() {
        // const result = await db.query('SELECT * FROM nodePoint WHERE deleted = FALSE')
        const result = await db.query('SELECT * FROM nodePoint')
        return result.rows
      },
    },
    fetchHierarchy: {
      type: new GraphQLList(NodePointType),
      args: { id: { type: GraphQLInt } },
      async resolve(_, { id }) {
        const result = await db.query(
          `WITH RECURSIVE node_hierarchy AS (
             SELECT * FROM nodePoint WHERE id = $1
             UNION ALL
             SELECT np.* FROM nodePoint np
             INNER JOIN node_hierarchy nh ON np.parent = nh.id
           )
           SELECT * FROM node_hierarchy WHERE deleted = FALSE`,
          [id],
        )
        return result.rows
      },
    },
    fetchNodeHistory: {
      type: new GraphQLList(NodePointHistoryType),
      args: { nodePointId: { type: GraphQLInt } },
      async resolve(_, { nodePointId }) {
        const result = await db.query(`SELECT * FROM nodePointHistory WHERE nodePointId = $1 ORDER BY timestamp DESC`, [
          nodePointId,
        ])
        return result.rows
      },
    },
  },
})

// Mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addNodePoint: {
      type: NodePointType,
      args: {
        parent: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        data: { type: GraphQLJSON },
      },
      async resolve(_, { parent, title, description, data }) {
        try {
          const result = await db.query(
            `INSERT INTO nodePoint (parent, title, description, data) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [parent, title, description, data],
          )
          return result.rows[0]
        } catch (error) {
          if (error.code === '23505') {
            // PostgreSQL unique constraint violation code
            throw new Error('Duplicate name.')
          }
          throw new Error('An unexpected error occurred.')
        }
      },
    },
    updateNodePoint: {
      type: NodePointType,
      args: {
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        data: { type: GraphQLJSON },
      },
      async resolve(_, { id, title, description, data }) {
        const existingNode = await db.query(`SELECT * FROM nodePoint WHERE id = $1 AND deleted = FALSE`, [id])

        if (existingNode.rows.length === 0) {
          throw new Error(`NodePoint with id ${id} does not exist.`)
        }

        const node = existingNode.rows[0]

        // Log the current version to the history table
        await db.query(
          `INSERT INTO nodePointHistory (nodePointId, version, title, description, data, action)
           VALUES ($1, $2, $3, $4, $5, 'update')`,
          [node.id, node.version, node.title, node.description, node.data],
        )

        // Update the node and increment its version
        const result = await db.query(
          `UPDATE nodePoint
           SET title = COALESCE($2, title),
               description = COALESCE($3, description),
               data = COALESCE($4, data),
               version = version + 1
           WHERE id = $1 AND deleted = FALSE
           RETURNING *`,
          [id, title, description, data],
        )

        return result.rows[0]
      },
    },
    deleteNodePoint: {
      type: NodePointType,
      args: { id: { type: GraphQLInt } },
      async resolve(_, { id }) {
        const existingNode = await db.query(`SELECT * FROM nodePoint WHERE id = $1 AND deleted = FALSE`, [id])

        if (existingNode.rows.length === 0) {
          throw new Error(`NodePoint with id ${id} does not exist.`)
        }

        const node = existingNode.rows[0]

        // Log the deletion to the history table
        await db.query(
          `INSERT INTO nodePointHistory (nodePointId, version, title, description, data, action)
           VALUES ($1, $2, $3, $4, $5, 'delete')`,
          [node.id, node.version, node.title, node.description, node.data],
        )

        // Soft delete the node
        const result = await db.query(
          `UPDATE nodePoint
           SET deleted = TRUE
           WHERE id = $1
           RETURNING *`,
          [id],
        )

        return result.rows[0]
      },
    },
    moveMultipleNodePoints: {
      type: new GraphQLList(NodePointType),
      args: {
        newParent: { type: GraphQLInt },
        nodeIds: { type: new GraphQLList(GraphQLInt) },
      },
      async resolve(_, { newParent, nodeIds }) {
        const movedNodes = []
        for (const id of nodeIds) {
          try {
            const result = await db.query(
              `UPDATE nodePoint
               SET parent = $1
               WHERE id = $2 AND deleted = FALSE
                 AND NOT EXISTS (
                   SELECT 1 FROM nodePoint WHERE parent = $1 AND title = (
                     SELECT title FROM nodePoint WHERE id = $2
                   )
                 )
               RETURNING *`,
              [newParent, id],
            )
            if (result.rows.length > 0) {
              movedNodes.push(result.rows[0])
            }
          } catch (error) {
            console.error(`Failed to move node ${id}:`, error.message)
          }
        }
        return movedNodes
      },
    },
  },
})

// Export Schema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
})
