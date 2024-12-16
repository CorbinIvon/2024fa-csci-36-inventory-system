require('dotenv').config({ path: '../../.env' })
import { NodePoint, NodePointData } from './nodePoint'

const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 4000

export class NodeAPI {
  private apiUrl: string

  constructor(apiUrl: string = `http://${window.location.hostname}:${GRAPHQL_PORT}/graphql`) {
    this.apiUrl = apiUrl
  }

  private async graphqlRequest(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })
    return response.json()
  }

  async fetchAll(): Promise<NodePoint[]> {
    const query = `
      query {
        fetchAll {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(query)
    return this.buildNodeTree(response.data.fetchAll)
  }

  async fetchHierarchy(id: number): Promise<NodePoint[]> {
    const query = `
      query($id: Int!) {
        fetchHierarchy(id: $id) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(query, { id })
    return this.buildNodeTree(response.data.fetchHierarchy)
  }

  async createNode(data: NodePointData): Promise<NodePoint> {
    const mutation = `
      mutation($input: NodePointInput!) {
        addNodePoint(input: $input) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(mutation, { input: data })
    return new NodePoint(response.data.addNodePoint)
  }

  async updateNode(id: number, data: Partial<NodePointData>): Promise<NodePoint> {
    const mutation = `
      mutation($input: UpdateNodePointInput!) {
        updateNodePoint(input: $input) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(mutation, {
      input: { id, ...data },
    })
    return new NodePoint(response.data.updateNodePoint)
  }

  async deleteNode(id: number): Promise<NodePoint> {
    const mutation = `
      mutation($id: Int!) {
        deleteNodePoint(id: $id) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(mutation, { id })
    return new NodePoint(response.data.deleteNodePoint)
  }

  async moveNodes(nodeIds: number[], newParent: number | undefined): Promise<NodePoint[]> {
    const mutation = `
      mutation($nodeIds: [Int!]!, $newParent: Int) {
        moveMultipleNodePoints(nodeIds: $nodeIds, newParent: $newParent) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(mutation, { nodeIds, newParent })
    return response.data.moveMultipleNodePoints.map((node: NodePointData) => new NodePoint(node))
  }

  async restoreNode(id: number): Promise<NodePoint> {
    const mutation = `
      mutation($id: Int!) {
        restoreNodePoint(id: $id) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(mutation, { id })
    return new NodePoint(response.data.restoreNodePoint)
  }

  async hardDeleteNode(id: number): Promise<NodePoint> {
    const mutation = `
      mutation($id: Int!) {
        hardDeleteNodePoint(id: $id) {
          id parent title description data version deleted
        }
      }
    `
    const response = await this.graphqlRequest(mutation, { id })
    return new NodePoint(response.data.hardDeleteNodePoint)
  }

  private buildNodeTree(flatNodes: NodePointData[]): NodePoint[] {
    const nodeMap = new Map<number, NodePoint>()
    const rootNodes: NodePoint[] = []

    // Create all nodes first
    flatNodes.forEach((nodeData) => {
      const node = new NodePoint(nodeData)
      nodeMap.set(node.id!, node)
    })

    // Build the tree structure
    flatNodes.forEach((nodeData) => {
      const node = nodeMap.get(nodeData.id!)
      if (nodeData.parent && nodeMap.has(nodeData.parent)) {
        const parentNode = nodeMap.get(nodeData.parent)
        parentNode?.addChild(node!)
      } else {
        rootNodes.push(node!)
      }
    })

    return rootNodes
  }
}
