'use client'
import React, { useState } from 'react'
import { Add, Close } from '@mui/icons-material'
import NodeData from '@repo/node-api/src/nodeData'
import NodeCard from './NodeCard'
import NodeDescriptionModal from './NodeDescriptionModal'
import NodeCreationForm from './NodeCreationForm'
import SearchBar from '../search/SearchBar'

interface NodeListProps {
  rootNodes: NodeData[]
  onNodeCreate: (data: { name: string; description: string; parentNodeID?: string }) => void
}

const NodeList: React.FC<NodeListProps> = ({ rootNodes, onNodeCreate }) => {
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null)
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<NodeData[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  const currentNodes = currentNode ? currentNode.getChildren() : rootNodes

  const handleNodeClick = (node: NodeData) => {
    if (node.getChildren().length > 0) {
      setNavigationHistory((prev) => (currentNode ? [...prev, currentNode] : []))
      setCurrentNode(node)
    }
  }

  const handleBack = () => {
    const previousNode = navigationHistory[navigationHistory.length - 1]
    setNavigationHistory((prev) => prev.slice(0, -1))
    setCurrentNode(previousNode || null)
  }

  const getBreadcrumbs = () => {
    return [
      {
        id: 'root',
        name: 'Root',
        onClick: () => {
          setCurrentNode(null)
          setNavigationHistory([])
        },
      },
      ...navigationHistory.map((node) => ({
        id: node.id,
        name: node.name || 'Unnamed',
        onClick: () => {
          const index = navigationHistory.indexOf(node)
          setCurrentNode(node)
          setNavigationHistory((prev) => prev.slice(0, index))
        },
      })),
      ...(currentNode
        ? [
            {
              id: currentNode.id,
              name: currentNode.name || 'Unnamed',
              onClick: () => {},
            },
          ]
        : []),
    ]
  }

  const handleAddClick = (parentNode: NodeData | null) => {
    setSelectedParentId(parentNode?.id || null)
    setIsFormVisible(true)
  }

  const handleFormSubmit = (data: { name: string; description: string; parentNodeID?: string }) => {
    onNodeCreate(data)
    setIsFormVisible(false)
    setSelectedParentId(null)
  }

  function getAllNodes(rootNodes: NodeData[]): NodeData[] {
    const allNodes: NodeData[] = []

    const traverseNodes = (nodes: NodeData[]) => {
      nodes.forEach((node) => {
        allNodes.push(node)
        if (node.getChildren().length > 0) {
          traverseNodes(node.getChildren())
        }
      })
    }

    traverseNodes(rootNodes)
    return allNodes
  }

  const navigateToNode = (targetNode: NodeData) => {
    const findPathToNode = (nodes: NodeData[], path: NodeData[] = []): NodeData[] | null => {
      for (const node of nodes) {
        if (node.id === targetNode.id) {
          return path
        }
        const children = node.getChildren()
        if (children.length > 0) {
          const foundPath = findPathToNode(children, [...path, node])
          if (foundPath) return foundPath
        }
      }
      return null
    }

    const path = findPathToNode(rootNodes)
    if (path) {
      setNavigationHistory(path)
      setCurrentNode(path[path.length - 1] || null)
    }
  }

  function handleSearch(term: string): void {
    setSearchTerm(term)
  }

  function handleClear(): void {
    setSearchTerm('')
  }

  return (
    <div className="p-6 relative">
      <div className="mb-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onClear={handleClear}
          nodes={rootNodes}
          onNodeSelect={navigateToNode}
        />
      </div>
      {/* Navigation breadcrumbs */}
      <div className="mb-4 flex items-center gap-2">
        {getBreadcrumbs().map((crumb, index, array) => (
          <React.Fragment key={`${crumb.id}-${index}`}>
            <button
              onClick={crumb.onClick}
              className={`hover:text-blue-500 ${index === array.length - 1 ? 'font-bold' : ''}`}
            >
              {crumb.name}
            </button>
            {index < array.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Back button */}
      {currentNode && (
        <button onClick={handleBack} className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          ← Back
        </button>
      )}

      {/* Node grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentNodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            onView={() => {
              setSelectedNode(node)
              setIsModalOpen(true)
            }}
            onEdit={() => handleNodeClick(node)}
            onAdd={() => handleAddClick(node)}
          />
        ))}
      </div>

      {/* Root level add button */}
      <button
        onClick={() => handleAddClick(currentNode)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
      >
        <Add sx={{ fontSize: 32 }} />
      </button>

      {/* Modal */}
      {selectedNode && (
        <NodeDescriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} node={selectedNode} />
      )}

      {/* Creation Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Node</h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="p-1 hover:bg-red-600 rounded-full transition-colors"
              >
                <Close sx={{ fontSize: 24 }} />
              </button>
            </div>
            <NodeCreationForm
              onSubmit={handleFormSubmit}
              parentNodes={getAllNodes(rootNodes).map((node) => ({
                id: node.id,
                name: node.name || '',
              }))}
              defaultParentId={selectedParentId}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default NodeList
