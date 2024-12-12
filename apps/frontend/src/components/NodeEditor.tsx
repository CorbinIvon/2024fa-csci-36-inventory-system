import { NodePoint, NodePointData } from '@repo/node-api/src/nodePoint'
import { useState, useEffect } from 'react'
import { Button } from './Buttons/Button'

interface NodeEditorProps {
  node: NodePoint | null
  onSave: (data: Partial<NodePointData>) => Promise<void>
  onCancel: () => void
  onDelete: () => void
}

interface KeyValuePair {
  key: string
  value: string
}

function KeyValueEditor({
  data,
  onChange,
  onAdd,
  onDelete,
}: {
  data: Record<string, any>
  onChange: (key: string, value: string, oldKey?: string) => void
  onAdd: () => void
  onDelete: (key: string) => void
}) {
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({})

  return (
    <div className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => onDelete(key)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete field"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <input
            type="text"
            value={editingKeys[key] ?? key}
            onChange={(e) => {
              setEditingKeys((prev) => ({ ...prev, [key]: e.target.value }))
            }}
            onBlur={(e) => {
              const newKey = editingKeys[key]
              if (newKey !== undefined && newKey !== key) {
                onChange(newKey, value, key)
                setEditingKeys((prev) => {
                  const next = { ...prev }
                  delete next[key]
                  return next
                })
              }
            }}
            className="w-1/2 p-2 border rounded"
            placeholder="Key"
          />
          <input
            type="text"
            value={typeof value === 'string' ? value : JSON.stringify(value)}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-1/2 p-2 border rounded"
            placeholder="Value"
          />
        </div>
      ))}
      <Button type="button" onClick={onAdd} variant="ghost" size="sm">
        Add Field
      </Button>
    </div>
  )
}

export function NodeEditor({ node, onSave, onCancel, onDelete }: NodeEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [jsonData, setJsonData] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isJsonMode, setIsJsonMode] = useState(false)

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

  const getParsedData = (): Record<string, any> => {
    try {
      return JSON.parse(jsonData)
    } catch {
      return {}
    }
  }

  const updateKeyValue = (key: string, value: string, oldKey?: string) => {
    const data = getParsedData()
    if (oldKey !== undefined && oldKey !== key) {
      // If we're updating a key, remove the old key and add the new one
      delete data[oldKey]
    }
    data[key] = value
    setJsonData(JSON.stringify(data, null, 2))
    validateJson(JSON.stringify(data, null, 2))
  }

  const addNewField = () => {
    const data = getParsedData()
    data[''] = ''
    setJsonData(JSON.stringify(data, null, 2))
    validateJson(JSON.stringify(data, null, 2))
  }

  const deleteField = (key: string) => {
    const data = getParsedData()
    delete data[key]
    setJsonData(JSON.stringify(data, null, 2))
    validateJson(JSON.stringify(data, null, 2))
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
              <div>
                <label className="block">Data</label>
                <p className="text-sm text-gray-500 mt-1">
                  Note: &quot;icon&quot; and &quot;count&quot; are special keys with built-in functionality
                </p>
              </div>
              <div className="space-x-2">
                <Button type="button" onClick={() => setIsJsonMode(!isJsonMode)} variant="ghost" size="sm">
                  {isJsonMode ? 'Switch to Key-Value' : 'Switch to JSON'}
                </Button>
                {isJsonMode && (
                  <>
                    <Button type="button" onClick={formatJson} variant="ghost" size="sm">
                      Format
                    </Button>
                    <Button type="button" onClick={minifyJson} variant="ghost" size="sm">
                      Minify
                    </Button>
                  </>
                )}
              </div>
            </div>
            {isJsonMode ? (
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
            ) : (
              <div className="border rounded p-4">
                <KeyValueEditor
                  data={getParsedData()}
                  onChange={updateKeyValue}
                  onAdd={addNewField}
                  onDelete={deleteField}
                />
              </div>
            )}
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
