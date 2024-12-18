'use client'
import { useEffect, useState } from 'react'
import { NodeAPI } from '@repo/node-api/src/nodeAPI'
import { NodePoint } from '@repo/node-api/src/nodePoint'
import { NodeTree } from '../components/NodeTree'
import { NodeEditor } from '../components/NodeEditor'
import { NodeDisplay } from '../components/NodeDisplay'
import { SearchBar } from '../components/SearchBar'
import { Breadcrumb } from '../components/Breadcrumb'
import { Search, SquarePlus } from 'lucide-react'
import { Button } from '../components/Buttons/Button'
import { ButtonRound } from '../components/Buttons/ButtonRound'

export default function Home() {
  const [nodeApi] = useState(() => new NodeAPI())
  const [nodes, setNodes] = useState<NodePoint[]>([])
  const [selectedNode, setSelectedNode] = useState<NodePoint | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [filteredNodes, setFilteredNodes] = useState<NodePoint[]>([])

  useEffect(() => {
    loadNodes()
  }, [])

  async function loadNodes() {
    const fetchedNodes = await nodeApi.fetchAll()
    setNodes(fetchedNodes)
    setFilteredNodes(fetchedNodes)
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
      setFilteredNodes(fetchedNodes)
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
      setFilteredNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }

  async function handleNodeHardDelete() {
    if (!selectedNode?.id) return

    try {
      await nodeApi.hardDeleteNode(selectedNode.id)
      // Refresh the tree
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
      setFilteredNodes(fetchedNodes)
      setSelectedNode(null)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to hard delete node:', error)
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
      setFilteredNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to restore node:', error)
    }
  }

  async function handleAddNode(parentId: number | undefined) {
    try {
      const newNode = await nodeApi.createNode({
        parent: parentId,
        title: 'New Node',
        description: '',
      })
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
      setFilteredNodes(fetchedNodes)
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
      setFilteredNodes(fetchedNodes)
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
      setFilteredNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to restore node:', error)
    }
  }

  async function handleMoveNode(nodeId: number, newParentId: number) {
    try {
      await nodeApi.moveNodes([nodeId], newParentId === 0 ? undefined : newParentId)
      const fetchedNodes = await nodeApi.fetchAll()
      setNodes(fetchedNodes)
      setFilteredNodes(fetchedNodes)
    } catch (error) {
      console.error('Failed to move node:', error)
    }
  }

  return (
    <main className="flex min-h-screen">
      <div className="w-1/3 border-r p-4">
        <div className="mb-4">
          <SearchBar
            nodes={nodes}
            onSearch={setFilteredNodes}
            onNodeSelect={(id) => {
              const node = findNodeById(nodes, parseInt(id))
              setSelectedNode(node)
              // Keep the original tree structure
              setFilteredNodes(nodes)
            }}
          />
        </div>
        <div className="flex items-center gap-2 mb-4 p-2 border-b">{/* TODO: Add more context options here. */}</div>
        <NodeTree
          nodes={filteredNodes}
          onNodeSelect={(id) => {
            const node = findNodeById(nodes, parseInt(id))
            setSelectedNode(node)
          }}
          onAddChild={handleAddNode}
          onDelete={handleContextDelete}
          onRestore={handleContextRestore}
          onMoveNode={handleMoveNode}
          selectedNodeId={selectedNode?.id}
        />
      </div>
      <div className="w-2/3 p-4">
        {selectedNode ? (
          <>
            <div className="mb-4">
              <Breadcrumb
                nodes={nodes}
                selectedNodeId={selectedNode.id}
                onNodeClick={(nodeId) => {
                  const node = findNodeById(nodes, nodeId)
                  setSelectedNode(node)
                }}
              />
            </div>
            {isEditing ? (
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
                onAddClick={(parent) => {
                  if (!selectedNode.deleted) {
                    handleAddNode(parent)
                  }
                }}
                onRestore={handleNodeRestore}
                onHardDelete={handleNodeHardDelete}
              />
            )}
          </>
        ) : nodes.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
              <p className="text-gray-600 mb-6">Get started by creating your first node</p>
              <Button variant="primary" icon={SquarePlus} onClick={() => handleAddNode(undefined)} className="w-full">
                Add Root Node
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">Select a node to view or edit</div>
        )}
      </div>
    </main>
  )
}
