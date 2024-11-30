'use client'
import { useEffect, useState } from 'react'
import { NodeAPI } from '@repo/node-api/src/nodeAPI'
import { NodePoint } from '@repo/node-api/src/nodePoint'
import { NodeTree } from '../components/NodeTree'
import { NodeEditor } from '../components/NodeEditor'
import { NodeDisplay } from '../components/NodeDisplay'
import { Search } from 'lucide-react'

export default function Home() {
  const [nodeApi] = useState(() => new NodeAPI())
  const [nodes, setNodes] = useState<NodePoint[]>([])
  const [selectedNode, setSelectedNode] = useState<NodePoint | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadNodes()
  })

  async function loadNodes() {
    const fetchedNodes = await nodeApi.fetchAll()
    setNodes(fetchedNodes)
  }

  async function handleNodeUpdate(data: Partial<NodePoint>) {
    if (!selectedNode?.id) return

    await nodeApi.updateNode(selectedNode.id, data)
    await loadNodes()
  }

  async function handleNodeDelete() {
    if (!selectedNode?.id) return
    if (!confirm('Are you sure you want to delete this node?')) return

    await nodeApi.deleteNode(selectedNode.id)
    setSelectedNode(null)
    await loadNodes()
  }

  async function handleNodeRestore() {
    if (!selectedNode?.id) return
    await nodeApi.restoreNode(selectedNode.id)
    await loadNodes()
  }

  return (
    <main className="flex min-h-screen">
      <div className="w-1/3 border-r p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search nodes..." className="pl-10 pr-4 py-2 w-full border rounded" />
          </div>
        </div>
        <NodeTree
          nodes={nodes}
          onNodeSelect={(id) => {
            const node = nodes.find((n) => n.id === parseInt(id))
            setSelectedNode(node || null)
          }}
        />
      </div>
      <div className="w-2/3 p-4">
        {selectedNode &&
          (isEditing ? (
            <NodeEditor
              node={selectedNode}
              onSave={async (data) => {
                await handleNodeUpdate(data)
                setIsEditing(false)
              }}
              onCancel={() => setIsEditing(false)}
              onDelete={handleNodeDelete}
            />
          ) : (
            <NodeDisplay node={selectedNode} onEditClick={() => setIsEditing(true)} onRestore={handleNodeRestore} />
          ))}
      </div>
    </main>
  )
}
