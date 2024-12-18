import { NodePoint } from '@repo/node-api/src/nodePoint'
import { Edit2, SquarePlus } from 'lucide-react'
import { Button } from './Buttons/Button'
import { ButtonRound } from './Buttons/ButtonRound'

interface NodeDisplayProps {
  node: NodePoint | null
  onEditClick: () => void
  onAddClick: (parent: number | undefined) => void
  onRestore?: () => void
  onHardDelete?: () => void
  onSoftDelete?: () => void
}

function KeyValueDisplay({ data }: { data: Record<string, any> }) {
  return (
    <table className="w-full table-fixed">
      <colgroup>
        <col className="w-auto" />
        <col className="w-auto" />
      </colgroup>
      <thead>
        <tr>
          <th className="py-2 px-4 text-left font-medium border border-[var(--primary-color)] border-opacity-20 strong underline">
            Key
          </th>
          <th className="py-2 px-4 text-left font-medium border border-[var(--primary-color)] border-opacity-20 strong underline">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td className="py-2 px-4 font-medium whitespace-nowrap overflow-hidden text-ellipsis border border-[var(--primary-color)] border-opacity-20">
              {key}
            </td>
            <td className="py-2 px-4 font-mono break-all border border-[var(--primary-color)] border-opacity-20">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function NodeDisplay({
  node,
  onEditClick,
  onAddClick,
  onRestore,
  onHardDelete,
  onSoftDelete,
}: NodeDisplayProps) {
  if (!node) return null

  return (
    <div className="p-4 border rounded-lg">
      {node.deleted && onRestore && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>This node has been deleted</span>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={onRestore}>
              Restore
            </Button>
            {onHardDelete && (
              <Button variant="danger" size="sm" onClick={onHardDelete}>
                Hard Delete
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">{node.title}</h2>
        {!node.deleted && (
          <div className="flex gap-2">
            <ButtonRound variant="ghost" icon={Edit2} onClick={onEditClick} title="Edit node" />
            <ButtonRound variant="ghost" icon={SquarePlus} onClick={() => onAddClick(node.id)} title="Add child" />
            {onSoftDelete && (
              <Button variant="danger" size="sm" onClick={onSoftDelete}>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="inline-grid grid-cols-3 gap-x-6 text-xs">
          <div>
            <label className="font-medium text-gray-500">Parent ID</label>
            <p>{node.parent || 'None'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">ID</label>
            <p>{node.id}</p>
          </div>
          <div>
            <label className="font-medium text-gray-500">Version</label>
            <p>{node.version}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Description</label>
          <p className="whitespace-pre-wrap">{node.description || 'No description'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Data</label>
          <div className="bg-[var(--secondary-color)] bg-opacity-5 p-4 rounded border border-[var(--secondary-color)] border-opacity-20">
            {Object.keys(node.data || {}).length > 0 ? (
              <KeyValueDisplay data={node.data || {}} />
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
