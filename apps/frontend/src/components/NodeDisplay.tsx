import { NodePoint } from '@repo/node-api/src/nodePoint'
import { Edit2 } from 'lucide-react'

interface NodeDisplayProps {
  node: NodePoint | null
  onEditClick: () => void
}

export function NodeDisplay({ node, onEditClick }: NodeDisplayProps) {
  if (!node) return null

  return (
    <div className="p-4 border rounded-lg">
      {node.deleted && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">This node has been deleted</div>}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">{node.title}</h2>
        <button onClick={onEditClick} className="p-2 hover:bg-gray-100 rounded-full" title="Edit node">
          <Edit2 size={20} />
        </button>
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
