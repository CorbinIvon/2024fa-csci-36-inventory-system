import { NodePoint } from '@repo/node-api/src/nodePoint'
import { useState, useEffect } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronRight, ChevronDown, Folder, File, LucideIcon, SquarePlus } from 'lucide-react'
import { ContextMenu } from './ContextMenu'
import * as LucideIcons from 'lucide-react'

interface NodeTreeProps {
  nodes: NodePoint[]
  onNodeSelect?: (nodeId: string) => void
  onAddChild?: (parentId: number | undefined) => void
  onDelete?: (nodeId: number) => void
  onRestore?: (nodeId: number) => void
  onMoveNode?: (nodeId: number, newParentId: number) => void
  selectedNodeId?: number
}

interface TreeNodeProps {
  node: NodePoint
  onSelect?: (nodeId: string) => void
  onAddChild?: (parentId: number) => void
  onDelete?: (nodeId: number) => void
  onRestore?: (nodeId: number) => void
  onMoveNode?: (nodeId: number, newParentId: number) => void
  rootNodes: NodePoint[]
  selectedNodeId?: number // Add this prop
  isExpanded: boolean
  onToggleExpand: (nodeId: number) => void
  expandedNodes: Set<number> // Add this prop
}

function TreeNode({
  node,
  onSelect,
  onAddChild,
  onDelete,
  onRestore,
  onMoveNode,
  rootNodes,
  selectedNodeId,
  isExpanded,
  onToggleExpand,
  expandedNodes, // Add this prop
}: TreeNodeProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  const renderNodeIcon = () => {
    try {
      const nodeData = node.data || {}
      const iconValue = (nodeData.icon || nodeData.Icon || '').toString()

      // First check if it's a Lucide icon name
      if (iconValue && iconValue in LucideIcons) {
        // Safe access to icon component using type assertion
        const IconComponent = (LucideIcons as any)[iconValue] as typeof Folder
        return <IconComponent size={16} />
      }

      // Then check if it's a text/emoji that should be rendered directly
      if (iconValue) {
        // If it's longer than 3 characters and not an emoji, truncate it
        const isEmoji = /\p{Emoji}/u.test(iconValue)
        if (!isEmoji && iconValue.length > 3) {
          return <span className="text-sm font-medium">{iconValue.substring(0, 3)}</span>
        }
        return <span className="text-sm font-medium">{iconValue}</span>
      }

      // Fallback to default icons
      const DefaultIcon = hasChildren ? Folder : File
      return <DefaultIcon size={16} />
    } catch (error) {
      console.warn(`Failed to render icon for node ${node.id}:`, error)
      const DefaultIcon = hasChildren ? Folder : File
      return <DefaultIcon size={16} />
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (node.deleted) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('nodeId', node.id!.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation() // Add this to prevent event bubbling
    if (!node.deleted) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation() // Add this to prevent event bubbling
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation() // Add this to prevent event bubbling
    setIsDragOver(false)
    const sourceId = parseInt(e.dataTransfer.getData('nodeId'))

    // Prevent dropping on self or if node is deleted
    if (sourceId === node.id || node.deleted) {
      return
    }

    // Check if trying to drop on a descendant
    const isDescendant = (parentId: number): boolean => {
      if (parentId === sourceId) return true
      const parent = node.children.find((n) => n.id === parentId)
      if (!parent) return false
      return parent.children.some((child) => isDescendant(child.id!))
    }

    if (!isDescendant(node.id!)) {
      onMoveNode?.(sourceId, node.id!)
    }
  }

  return (
    <div className="pl-2" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <div
        className={`flex items-center gap-2 p-1 rounded cursor-pointer
          ${node.deleted ? 'opacity-50 italic' : 'hover:bg-gray-100'}
          ${isDragOver ? 'bg-blue-50 border border-blue-200' : ''}
          ${selectedNodeId === node.id ? 'bg-blue-100' : ''}
        `}
        draggable={!node.deleted}
        onDragStart={handleDragStart}
        onClick={(e) => {
          if (onSelect) onSelect(node.id!.toString())
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }}
      >
        {/* Icon container with fixed width */}
        <div className="w-6 flex justify-center">
          {hasChildren ? (
            <button
              className={`p-0 w-6 h-6 inline-flex items-center justify-center transition-transform duration-200
                hover:text-gray-700 text-gray-500 bg-transparent
                ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(node.id!)
              }}
            >
              <ChevronRight size={14} />
            </button>
          ) : null}
        </div>
        {/* Fixed width container for folder/file icon */}
        <div className="w-5 flex justify-center">{renderNodeIcon()}</div>
        <span className="text-sm flex items-center gap-1 flex-grow">
          {node.title}
          {node.deleted && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Deleted</span>}
        </span>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewNode={() => {
            if (onAddChild && node.id) onAddChild(node.id)
            setContextMenu(null)
          }}
          onDelete={() => {
            if (onDelete && node.id) onDelete(node.id)
            setContextMenu(null)
          }}
          onRestore={() => {
            if (onRestore && node.id) onRestore(node.id)
            setContextMenu(null)
          }}
          onMove={(targetNodeId) => {
            if (onMoveNode && node.id) {
              onMoveNode(node.id, targetNodeId)
            }
          }}
          nodes={rootNodes} // Pass the complete tree here
          currentNodeId={node.id}
          isDeleted={node.deleted}
        />
      )}
      {isExpanded && hasChildren && (
        <div className="ml-4 border-l border-gray-200">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onRestore={onRestore}
              onMoveNode={onMoveNode}
              rootNodes={rootNodes} // Pass down the complete tree
              selectedNodeId={selectedNodeId}
              isExpanded={expandedNodes.has(child.id!)}
              onToggleExpand={onToggleExpand}
              expandedNodes={expandedNodes} // Pass this prop
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function NodeTree({
  nodes,
  onNodeSelect,
  onAddChild,
  onDelete,
  onRestore,
  onMoveNode,
  selectedNodeId,
}: NodeTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [isDragOver, setIsDragOver] = useState(false)

  // Function to find path to node
  const findPathToNode = (nodeId: number, nodeList: NodePoint[]): number[] => {
    for (const node of nodeList) {
      if (node.id === nodeId) return [node.id]
      if (node.children.length > 0) {
        const path = findPathToNode(nodeId, node.children)
        if (path.length) return [node.id!, ...path]
      }
    }
    return []
  }

  // Expand path to selected node
  useEffect(() => {
    if (selectedNodeId) {
      const path = findPathToNode(selectedNodeId, nodes)
      setExpandedNodes(new Set([...Array.from(expandedNodes), ...path]))
    }
  }, [selectedNodeId, nodes])

  const handleToggleExpand = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleRootDragLeave = () => {
    setIsDragOver(false)
  }

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const nodeId = parseInt(e.dataTransfer.getData('nodeId'))
    if (!isNaN(nodeId)) {
      // Pass undefined or null as newParent to make it a root node
      onMoveNode?.(nodeId, 0)
    }
  }

  return (
    <NavigationMenu.Root
      className={`relative p-2 min-h-[calc(100vh-12rem)] rounded-lg flex flex-col ${isDragOver ? 'bg-blue-50' : ''}`}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
    >
      <NavigationMenu.List className="m-0 p-0 list-none flex-grow">
        {nodes
          .filter((n) => !n.parent)
          .map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              onSelect={onNodeSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onRestore={onRestore}
              onMoveNode={onMoveNode}
              rootNodes={nodes} // Pass the complete tree here
              selectedNodeId={selectedNodeId}
              isExpanded={expandedNodes.has(node.id!)}
              onToggleExpand={handleToggleExpand}
              expandedNodes={expandedNodes} // Pass this prop
            />
          ))}
      </NavigationMenu.List>
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={() => onAddChild?.(undefined)}
          className="w-full py-2 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center justify-center gap-2"
        >
          <SquarePlus size={16} />
          Add Root Node
        </button>
      </div>
    </NavigationMenu.Root>
  )
}
