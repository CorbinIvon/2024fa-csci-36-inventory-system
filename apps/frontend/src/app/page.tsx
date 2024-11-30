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

  function findNodeById(nodes: NodePoint[], id: number): NodePoint | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children.length > 0) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  async function handleNodeUpdate(data: Partial<NodePoint>) {
    if (!selectedNode?.id) return

    try {
      const updatedNode = await nodeApi.updateNode(selectedNode.id, data)
      // Update the selected node with the API response
      setSelectedNode(updatedNode)
      // Refresh the tree
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update node:', error)
      // Optionally handle error state here
    }
  }

  async function handleNodeDelete() {
    if (!selectedNode?.id) return

    try {
      const deletedNode = await nodeApi.deleteNode(selectedNode.id)
      setIsEditing(false) // Exit edit mode
      setSelectedNode(deletedNode) // Keep the node selected but now marked as deleted
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }

  async function handleNodeRestore() {
    if (!selectedNode?.id) return

    try {
      const restoredNode = await nodeApi.restoreNode(selectedNode.id)
      // Update the selected node with the API response
      setSelectedNode(restoredNode)
      // Refresh the tree
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to restore node:', error)
    }
  }

  async function handleAddNode(parentId: number) {
    try {
      const newNode = await nodeApi.createNode({
        parent: parentId,
        title: 'New Node',
        description: '',
      })
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
      setSelectedNode(newNode)
      setIsEditing(true)
    } catch (error) {
      console.error('Failed to create node:', error)
    }
  }

  async function handleContextDelete(nodeId: number) {
    const nodeToDelete = findNodeById(nodes, nodeId)
    if (!nodeToDelete) return

    try {
      const deletedNode = await nodeApi.deleteNode(nodeId)
      // Update selected node without exiting edit mode
      if (selectedNode?.id === nodeId) {
        setSelectedNode(deletedNode)
      }
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }

  async function handleContextRestore(nodeId: number) {
    try {
      const restoredNode = await nodeApi.restoreNode(nodeId)
      if (selectedNode?.id === nodeId) {
        setSelectedNode(restoredNode)
      }
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to restore node:', error)
    }
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
            const node = findNodeById(nodes, parseInt(id))
            setSelectedNode(node)
          }}
          onAddChild={handleAddNode}
          onDelete={handleContextDelete}
          onRestore={handleContextRestore}
        />
      </div>
      <div className="w-2/3 p-4">
        {selectedNode &&
          (isEditing ? (
            <NodeEditor
              node={selectedNode}
              onSave={handleNodeUpdate}
              onCancel={() => setIsEditing(false)}
              onDelete={handleNodeDelete}
            />
          ) : (
            <NodeDisplay
              node={selectedNode}
              onEditClick={() => {
                if (!selectedNode.deleted) {
                  setIsEditing(true)
                }
              }}
              onRestore={handleNodeRestore}
            />
          ))}
      </div>
    </main>
  )
}
