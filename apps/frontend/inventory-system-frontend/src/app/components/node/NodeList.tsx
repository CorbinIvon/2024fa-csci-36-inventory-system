'use client'

import React, { useState } from 'react'
import Node from '@repo/node-api/src/node'
import NodeCard from './NodeCard'
import NodeDescriptionModal from './NodeDescriptionModal'

interface NodeListProps {
  rootNodes: Node[]
}

const NodeList: React.FC<NodeListProps> = ({ rootNodes }) => {
  const [currentNode, setCurrentNode] = useState<Node | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<Node[]>([])

  const currentNodes = currentNode ? currentNode.getChildren() : rootNodes

  const handleNodeClick = (node: Node) => {
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
        name: 'Root',
        onClick: () => {
          setCurrentNode(null)
          setNavigationHistory([])
        },
      },
      ...navigationHistory.map((node) => ({
        name: node.value.name,
        onClick: () => {
          const index = navigationHistory.indexOf(node)
          setCurrentNode(node)
          setNavigationHistory((prev) => prev.slice(0, index))
        },
      })),
      ...(currentNode ? [{ name: currentNode.value.name, onClick: () => {} }] : []),
    ]
  }

  return (
    <div className="p-6">
      {/* Navigation breadcrumbs */}
      <div className="mb-4 flex items-center gap-2">
        {getBreadcrumbs().map((crumb, index, array) => (
          <React.Fragment key={crumb.name}>
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
            key={node.value.id}
            node={node}
            onView={() => {
              setSelectedNode(node)
              setIsModalOpen(true)
            }}
            onEdit={() => handleNodeClick(node)}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedNode && (
        <NodeDescriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} node={selectedNode} />
      )}
    </div>
  )
}

export default NodeList
