import { NodePoint } from '@repo/node-api/src/nodePoint'
import { useState } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react'
import { ContextMenu } from './ContextMenu'

interface NodeTreeProps {
  nodes: NodePoint[]
  onNodeSelect?: (nodeId: string) => void
  onAddChild?: (parentId: number) => void
  onDelete?: (nodeId: number) => void
  onRestore?: (nodeId: number) => void
}

interface TreeNodeProps {
  node: NodePoint
  onSelect?: (nodeId: string) => void
  onAddChild?: (parentId: number) => void
  onDelete?: (nodeId: number) => void
  onRestore?: (nodeId: number) => void
}

function TreeNode({ node, onSelect, onAddChild, onDelete, onRestore }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="pl-2">
      <div
        className={`flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer
          ${node.deleted ? 'opacity-50 italic' : ''}`}
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
                setIsExpanded(!isExpanded)
              }}
            >
              <ChevronRight size={14} />
            </button>
          ) : null}
        </div>
        {/* Fixed width container for folder/file icon */}
        <div className="w-5 flex justify-center">{hasChildren ? <Folder size={16} /> : <File size={16} />}</div>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function NodeTree({ nodes, onNodeSelect, onAddChild, onDelete, onRestore }: NodeTreeProps) {
  return (
    <NavigationMenu.Root className="relative">
      <NavigationMenu.List className="m-0 p-0 list-none">
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
            />
          ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
