'use client'

import React from 'react'
import Node from '@repo/node-api/src/node'

interface NodeCardProps {
  node: Node
  onView: () => void
  onEdit?: () => void
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onView, onEdit }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{node.value.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{node.value.description}</p>
      <div className="flex gap-2">
        <button onClick={onView} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          View
        </button>
        {onEdit && node.getChildren().length > 0 && (
          <button onClick={onEdit} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
            Navigate
          </button>
        )}
      </div>
    </div>
  )
}

export default NodeCard
