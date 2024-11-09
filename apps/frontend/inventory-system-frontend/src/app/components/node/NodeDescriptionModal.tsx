'use client'

import React from 'react'
import Node from '@repo/node-api/src/node'

interface NodeDescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  node: Node
}

const NodeDescriptionModal: React.FC<NodeDescriptionModalProps> = ({ isOpen, onClose, node }) => {
  if (!isOpen) return null

  const children = node.getChildren()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{node.value.name}</h2>
        <p className="text-gray-600 mb-4">{node.value.description}</p>

        {children.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Child Nodes:</h3>
            <ul className="list-disc pl-6">
              {children.map((child) => (
                <li key={child.value.id} className="mb-2">
                  <span className="font-medium">{child.value.name}</span>
                  <p className="text-sm text-gray-500">{child.value.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={onClose} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Close
        </button>
      </div>
    </div>
  )
}

export default NodeDescriptionModal
