import { NodePoint, NodePointData } from '@repo/node-api/src/nodePoint'
import { useState, useEffect } from 'react'

interface NodeEditorProps {
  node: NodePoint | null
  onSave: (data: Partial<NodePointData>) => Promise<void>
  onCancel: () => void
  onDelete: () => void
}

export function NodeEditor({ node, onSave, onCancel, onDelete }: NodeEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [jsonData, setJsonData] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setDescription(node.description)
      setJsonData(JSON.stringify(node.data || {}, null, 2))
    }
  }, [node])

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json)
      setJsonError(null)
      return true
    } catch (error) {
      setJsonError((error as Error).message)
      return false
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonData)
      setJsonData(JSON.stringify(parsed, null, 2))
      setJsonError(null)
    } catch (error) {
      setJsonError((error as Error).message)
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonData)
      setJsonData(JSON.stringify(parsed))
      setJsonError(null)
    } catch (error) {
      setJsonError((error as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateJson(jsonData)) return

    try {
      await onSave({
        title,
        description,
        data: JSON.parse(jsonData),
      })
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  if (!node) return null

  return (
    <div className="p-4 border rounded-lg">
      {node.deleted && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          This node has been deleted. Saving will restore the node.
        </div>
      )}
      <h2 className="text-xl mb-4">Edit Node</h2>
      <form onSubmit={handleSubmit}>
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
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block">Data (JSON)</label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={formatJson}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={minifyJson}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Minify
                </button>
              </div>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => {
                setJsonData(e.target.value)
                validateJson(e.target.value)
              }}
              className={`w-full p-2 border rounded font-mono text-sm h-48 ${jsonError ? 'border-red-500' : ''}`}
              spellCheck={false}
            />
            {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={!!jsonError}
              className={`px-4 py-2 text-white rounded ${
                jsonError ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 ml-auto"
            >
              Delete Node
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
