'use client'

import React from 'react'
import NodeData from '@repo/node-api/src/nodeData'
import { Add } from '@mui/icons-material'

interface NodeCardProps {
  node: NodeData
  onView: () => void
  onEdit?: () => void
  onAdd?: () => void
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onView, onEdit, onAdd }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
      <h3 className="text-lg font-semibold mb-2">{node?.name || 'Unnamed Node'}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{node?.description || 'No description available'}</p>
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
      {onAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-sm transition-colors"
        >
          <Add sx={{ fontSize: 20 }} />
        </button>
      )}
    </div>
  )
}

export default NodeCard
