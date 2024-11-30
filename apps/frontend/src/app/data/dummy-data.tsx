// data/dummy-data.tsx
import NodeData from '@repo/node-api/src/nodeData'

// Helper functions
export const generateNodeId = () => `node-${Math.random().toString(36).substr(2, 9)}`

export const findNodeById = (nodes: NodeData[], id: string): NodeData | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNodeById(node.getChildren(), id)
    if (found) return found
  }
  return null
}

// Demo node creation
export const createDemoNode = (): NodeData => {
  return new NodeData({
    id: 'demo-1',
    name: 'Demo Node',
    description: 'This is a demonstration of the NodeCard component',
    quantity: 1,
    tags: ['demo'],
    imageUrl: null,
    data: {},
  })
}

// Create initial dummy data structure
export const createDummyNodes = (): NodeData[] => {
  const root = new NodeData({
    id: 'org-001',
    name: 'Organization',
    description: 'Root organization node',
    quantity: 1,
    tags: ['organization', 'root'],
    imageUrl: null,
    data: { type: 'organization' },
  })

  const deptA = new NodeData({
    id: 'dept-001',
    name: 'Department A',
    description: 'First department',
    quantity: 1,
    tags: ['department'],
    imageUrl: null,
    data: { type: 'department' },
  })

  const deptB = new NodeData({
    id: 'dept-002',
    name: 'Department B',
    description: 'Second department',
    quantity: 1,
    tags: ['department'],
    imageUrl: null,
    data: { type: 'department' },
  })

  const teamA1 = new NodeData({
    id: 'team-001',
    name: 'Team A1',
    description: 'First team in Department A',
    quantity: 1,
    tags: ['team'],
    imageUrl: null,
    data: { type: 'team' },
  })

  const teamA2 = new NodeData({
    id: 'team-002',
    name: 'Team A2',
    description: 'Second team in Department A',
    quantity: 1,
    tags: ['team'],
    imageUrl: null,
    data: { type: 'team' },
  })

  const teamB1 = new NodeData({
    id: 'team-003',
    name: 'Team B1',
    description: 'First team in Department B',
    quantity: 1,
    tags: ['team'],
    imageUrl: null,
    data: { type: 'team' },
  })

  const teamB2 = new NodeData({
    id: 'team-004',
    name: 'Team B2',
    description: 'Second team in Department B',
    quantity: 1,
    tags: ['team'],
    imageUrl: null,
    data: { type: 'team' },
  })

  // Create team members
  const corbin = new NodeData({
    id: 'member-001',
    name: 'Corbin',
    description: 'Team member',
    quantity: 1,
    tags: ['member'],
    imageUrl: null,
    data: { role: 'developer' },
  })

  const charles = new NodeData({
    id: 'member-002',
    name: 'Charles',
    description: 'Team member',
    quantity: 1,
    tags: ['member'],
    imageUrl: null,
    data: { role: 'developer' },
  })

  const mark = new NodeData({
    id: 'member-003',
    name: 'Mark',
    description: 'Team member',
    quantity: 1,
    tags: ['member'],
    imageUrl: null,
    data: { role: 'developer' },
  })

  // Set up hierarchy
  teamA1.setChildren(corbin, charles, mark)
  deptA.setChildren(teamA1, teamA2)
  deptB.setChildren(teamB1, teamB2)
  root.setChildren(deptA, deptB)

  return [root]
}
