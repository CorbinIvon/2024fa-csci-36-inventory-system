import { NodePoint } from '@repo/node-api/src/nodePoint'
import { useState, useEffect } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronRight, ChevronDown, Folder, File, LucideIcon, SquarePlus } from 'lucide-react'
import { ContextMenu } from './ContextMenu'
import * as LucideIcons from 'lucide-react'
import { Button } from './Buttons/Button'
import { ButtonRound } from './Buttons/ButtonRound'

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
  expandedNodes,
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

  const renderCount = () => {
    try {
      const nodeData = node.data || {}
      if ('count' in nodeData) {
        const count = Number(nodeData.count)
        if (!isNaN(count)) {
          return (
            <span className="ml-auto text-xs bg-[var(--secondary-color)] bg-opacity-10 px-2 py-0.5 rounded-full text-[var(--primary-color)] font-medium">
              {count}
            </span>
          )
        }
      }
      return null
    } catch (error) {
      return null
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
        className={`flex items-center gap-2 p-1 pr-3 rounded cursor-pointer transition-colors relative
          ${node.deleted ? 'opacity-50 italic' : 'hover:bg-[var(--secondary-color)] hover:bg-opacity-10'}
          ${isDragOver ? 'bg-[var(--secondary-color)] bg-opacity-5 border border-[var(--secondary-color)] border-opacity-20' : ''}
          ${
            selectedNodeId === node.id
              ? 'bg-[var(--primary-color)] bg-opacity-10 border-l-4 border-[var(--primary-color)]'
              : 'border-l-4 border-transparent'
          }
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
            <ButtonRound
              variant="ghost"
              size="sm"
              icon={ChevronRight}
              className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(node.id!)
              }}
            />
          ) : null}
        </div>
        {/* Fixed width container for folder/file icon */}
        <div className="w-5 flex justify-center">{renderNodeIcon()}</div>
        <span className="text-sm flex items-center gap-1 min-w-0 flex-grow pr-12">
          <span className="truncate">{node.title}</span>
          {node.deleted && (
            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded shrink-0">Deleted</span>
          )}
        </span>
        {renderCount() && <div className="absolute right-2 top-1/2 -translate-y-1/2">{renderCount()}</div>}
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

export function NodeTree({ nodes, ...props }: NodeTreeProps) {
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
    if (props.selectedNodeId) {
      const path = findPathToNode(props.selectedNodeId, nodes)
      setExpandedNodes(new Set([...Array.from(expandedNodes), ...path]))
    }
  }, [props.selectedNodeId, nodes])

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
      props.onMoveNode?.(nodeId, 0)
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
              onSelect={props.onNodeSelect}
              onAddChild={props.onAddChild}
              onDelete={props.onDelete}
              onRestore={props.onRestore}
              onMoveNode={props.onMoveNode}
              rootNodes={nodes} // Pass the complete tree here
              selectedNodeId={props.selectedNodeId}
              isExpanded={expandedNodes.has(node.id!)}
              onToggleExpand={handleToggleExpand}
              expandedNodes={expandedNodes} // Pass this prop
            />
          ))}
      </NavigationMenu.List>
      <div className="mt-4 pt-4 border-t">
        <Button variant="primary" icon={SquarePlus} onClick={() => props.onAddChild?.(undefined)} className="w-full">
          Add Root Node
        </Button>
      </div>
    </NavigationMenu.Root>
  )
}
