import { NodePoint } from '@repo/node-api/src/nodePoint'
import { Edit2, SquarePlus } from 'lucide-react'

interface NodeDisplayProps {
  node: NodePoint | null
  onEditClick: () => void
  onAddClick: (parent: number | undefined) => void
  onRestore?: () => void
}

export function NodeDisplay({ node, onEditClick, onAddClick, onRestore }: NodeDisplayProps) {
  if (!node) return null

  return (
    <div className="p-4 border rounded-lg">
      {node.deleted && onRestore && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>This node has been deleted</span>
          <button onClick={onRestore} className="px-3 py-1 bg-red-200 hover:bg-red-300 rounded-full text-sm">
            Restore
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">{node.title}</h2>
        {!node.deleted && (
          <div className="flex">
            <button onClick={onEditClick} className="p-2 hover:bg-gray-100 rounded-full m-1" title="Edit node">
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => onAddClick(node.id)}
              className="p-2 hover:bg-gray-100 rounded-full m-1"
              title="Add child"
            >
              <SquarePlus size={20} />
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">ID</label>
          <p>{node.id}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Parent ID</label>
          <p>{node.parent || 'None'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Description</label>
          <p className="whitespace-pre-wrap">{node.description || 'No description'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Version</label>
          <p>{node.version}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Data</label>
          <pre className="bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(node.data, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
