import { NodePoint } from '@repo/node-api/src/nodePoint'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  nodes: NodePoint[]
  selectedNodeId: number | undefined
  onNodeClick: (nodeId: number) => void
}

export function Breadcrumb({ nodes, selectedNodeId, onNodeClick }: BreadcrumbProps) {
  if (!selectedNodeId) return null

  // Find a node by its ID in the tree
  const findNode = (id: number, nodeList: NodePoint[]): NodePoint | null => {
    for (const node of nodeList) {
      if (node.id === id) return node
      const found = findNode(id, node.children)
      if (found) return found
    }
    return null
  }

  // Build the path from root to the selected node
  const buildPath = (nodeId: number): NodePoint[] => {
    const path: NodePoint[] = []
    let currentNode = findNode(nodeId, nodes)

    while (currentNode) {
      path.unshift(currentNode) // Add to beginning of array
      if (currentNode.parent) {
        currentNode = findNode(currentNode.parent, nodes)
      } else {
        break
      }
    }

    return path
  }

  const path = buildPath(selectedNodeId)

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      {path.map((node, index) => (
        <div key={node.id} className="flex items-center">
          {index > 0 && <ChevronRight size={16} className="mx-2 text-gray-400" />}
          <button
            onClick={() => onNodeClick(node.id!)}
            className={`hover:text-blue-600 ${node.deleted ? 'italic text-gray-400' : ''} ${
              node.id === selectedNodeId ? 'font-medium text-gray-900' : ''
            }`}
          >
            {node.title}
          </button>
        </div>
      ))}
    </div>
  )
}
