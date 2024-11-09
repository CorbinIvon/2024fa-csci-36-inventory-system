'use client'

import React, { useState } from 'react'

interface NodeCreationFormProps {
  onSubmit: (data: { name: string; description: string; parentNodeID?: string }) => void
  parentNodes?: Array<{ id: string; name: string }>
}

const NodeCreationForm: React.FC<NodeCreationFormProps> = ({ onSubmit, parentNodes = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentNodeID: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ name: '', description: '', parentNodeID: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={4}
          required
        />
      </div>

      {parentNodes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Parent Node</label>
          <select
            value={formData.parentNodeID}
            onChange={(e) => setFormData({ ...formData, parentNodeID: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">None</option>
            {parentNodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Create Node
      </button>
    </form>
  )
}

export default NodeCreationForm
