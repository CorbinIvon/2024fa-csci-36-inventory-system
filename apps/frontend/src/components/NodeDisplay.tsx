import { NodePoint } from '@repo/node-api/src/nodePoint'
import { Edit2, SquarePlus } from 'lucide-react'
import { Button } from './Buttons/Button'
import { ButtonRound } from './Buttons/ButtonRound'

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
          <Button variant="primary" size="sm" onClick={onRestore}>
            Restore
          </Button>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">{node.title}</h2>
        {!node.deleted && (
          <div className="flex gap-2">
            <ButtonRound variant="ghost" icon={Edit2} onClick={onEditClick} title="Edit node" />
            <ButtonRound variant="ghost" icon={SquarePlus} onClick={() => onAddClick(node.id)} title="Add child" />
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
