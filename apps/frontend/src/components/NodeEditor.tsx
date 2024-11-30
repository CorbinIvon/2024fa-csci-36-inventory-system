import { NodePoint, NodePointData } from '@repo/node-api/src/nodePoint'
import { useState, useEffect } from 'react'

interface NodeEditorProps {
  node: NodePoint | null
  onSave: (data: Partial<NodePointData>) => Promise<void>
}

export function NodeEditor({ node, onSave }: NodeEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setDescription(node.description)
    }
  }, [node])

  if (!node) return null

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl mb-4">Edit Node</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await onSave({ title, description })
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
