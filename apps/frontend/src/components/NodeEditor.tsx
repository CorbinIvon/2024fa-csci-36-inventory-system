import { NodePoint, NodePointData } from '@repo/node-api/src/nodePoint'
import { useState, useEffect } from 'react'
import { Button } from './Buttons/Button'

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
                <Button type="button" onClick={formatJson} variant="ghost" size="sm">
                  Format
                </Button>
                <Button type="button" onClick={minifyJson} variant="ghost" size="sm">
                  Minify
                </Button>
              </div>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => {
                setJsonData(e.target.value)
                validateJson(e.target.value)
              }}
              className={`w-full p-2 border rounded font-mono text-sm h-48 bg-[var(--secondary-color)] bg-opacity-5
                ${jsonError ? 'border-red-500' : 'border-[var(--secondary-color)] border-opacity-20'}`}
              spellCheck={false}
            />
            {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={!!jsonError}
              className={jsonError ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={onDelete} className="ml-auto">
              Delete Node
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
