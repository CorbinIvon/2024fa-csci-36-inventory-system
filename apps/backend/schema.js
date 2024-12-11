const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLSchema,
  GraphQLInputObjectType,
} = require('graphql')
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

// NodePointInput Type
const NodePointInputType = new GraphQLInputObjectType({
  name: 'NodePointInput',
  fields: {
    parent: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    data: { type: GraphQLJSON },
  },
})

// Add new input type for updates that includes id
const UpdateNodePointInputType = new GraphQLInputObjectType({
  name: 'UpdateNodePointInput',
  fields: {
    id: { type: GraphQLInt },
    parent: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    data: { type: GraphQLJSON },
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
        input: { type: NodePointInputType },
      },
      async resolve(_, { input }) {
        try {
          const { parent, title, description, data } = input
          const result = await db.query(
            `INSERT INTO nodePoint (parent, title, description, data)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [parent, title, description, data],
          )
          return result.rows[0]
        } catch (error) {
          if (error.code === '23505') {
            throw new Error('Duplicate name.')
          }
          throw new Error('An unexpected error occurred.')
        }
      },
    },
    addMultipleNodePoints: {
      type: new GraphQLList(NodePointType),
      args: {
        nodes: { type: new GraphQLList(NodePointInputType) },
      },
      async resolve(_, { nodes }) {
        if (!nodes || nodes.length === 0) return []

        // Dynamically build the parameterized query
        const values = []
        const placeholders = nodes
          .map((node, i) => {
            const idx = i * 4
            values.push(node.parent, node.title, node.description, node.data)
            return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`
          })
          .join(', ')

        const query = `
    INSERT INTO nodePoint (parent, title, description, data)
    VALUES ${placeholders}
    RETURNING *
  `

        try {
          const result = await db.query(query, values)
          return result.rows // returns all newly inserted NodePoints
        } catch (error) {
          if (error.code === '23505') {
            throw new Error('Duplicate name.')
          }
          throw new Error('An unexpected error occurred.')
        }
      },
    },
    updateNodePoint: {
      type: NodePointType,
      args: {
        input: { type: UpdateNodePointInputType },
      },
      async resolve(_, { input }) {
        const { id, title, description, data } = input
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

        // Get the ancestors of newParent
        const ancestorsResult = await db.query(
          `WITH RECURSIVE ancestors AS (
         SELECT id, parent FROM nodePoint WHERE id = $1 AND deleted = FALSE
         UNION ALL
         SELECT np.id, np.parent FROM nodePoint np
         INNER JOIN ancestors a ON np.id = a.parent
         WHERE np.deleted = FALSE
       )
       SELECT id FROM ancestors`,
          [newParent],
        )
        const ancestorIds = ancestorsResult.rows.map((row) => row.id)

        for (const id of nodeIds) {
          try {
            // Check if newParent is a descendant of the node being moved
            if (ancestorIds.includes(id)) {
              throw new Error(`Cannot move node ${id} under its own descendant ${newParent}.`)
            }

            //Move the node
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
    restoreNodePoint: {
      type: NodePointType,
      args: { id: { type: GraphQLInt } },
      async resolve(_, { id }) {
        const existingNode = await db.query(`SELECT * FROM nodePoint WHERE id = $1 AND deleted = TRUE`, [id])

        if (existingNode.rows.length === 0) {
          throw new Error(`NodePoint with id ${id} is not deleted or does not exist.`)
        }

        const node = existingNode.rows[0]

        // Log the restoration to history
        await db.query(
          `INSERT INTO nodePointHistory (nodePointId, version, title, description, data, action)
           VALUES ($1, $2, $3, $4, $5, 'restore')`,
          [node.id, node.version, node.title, node.description, node.data],
        )

        // Restore the node
        const result = await db.query(
          `UPDATE nodePoint
           SET deleted = FALSE,
               version = version + 1
           WHERE id = $1
           RETURNING *`,
          [id],
        )

        return result.rows[0]
      },
    },
    hardDeleteNodePoint: {
      type: NodePointType,
      args: { id: { type: GraphQLInt } },
      async resolve(_, { id }) {
        // Ensure the node exists
        const existingNode = await db.query(`SELECT * FROM nodePoint WHERE id = $1`, [id])
        if (existingNode.rows.length === 0) {
          throw new Error(`NodePoint with id ${id} does not exist.`)
        }

        // Use a recursive CTE to find all descendants
        const descendantsQuery = `
          WITH RECURSIVE node_hierarchy AS (
            SELECT id FROM nodePoint WHERE id = $1
            UNION ALL
            SELECT np.id FROM nodePoint np
            INNER JOIN node_hierarchy nh ON np.parent = nh.id
          )
          SELECT id FROM node_hierarchy
        `
        const descendantsResult = await db.query(descendantsQuery, [id])
        const allIds = descendantsResult.rows.map((row) => row.id)

        // Delete the nodes themselves
        await db.query(`DELETE FROM nodePoint WHERE id = ANY($1::int[])`, [allIds])

        // Return the originally deleted node’s data
        return existingNode.rows[0]
      },
    },
  },
})

// Export Schema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
})
