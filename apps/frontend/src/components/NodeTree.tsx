import { NodePoint } from '@repo/node-api/src/nodePoint'
import { useState } from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react'

interface NodeTreeProps {
  nodes: NodePoint[]
  onNodeSelect?: (nodeId: string) => void
}

function TreeNode({ node, onSelect }: { node: NodePoint; onSelect?: (nodeId: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="pl-2">
      <div
        className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded cursor-pointer"
        onClick={(e) => {
          // Call onSelect regardless of whether it's a parent or child
          if (onSelect) onSelect(node.id!.toString())
          // Only toggle expansion if clicking the chevron area
          if (hasChildren && e.target === e.currentTarget.firstChild) {
            setIsExpanded(!isExpanded)
          }
        }}
      >
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation() // Prevent parent click
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {hasChildren ? <Folder size={16} /> : <File size={16} />}
        <span className="text-sm">{node.title}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-2 border-l">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

export function NodeTree({ nodes, onNodeSelect }: NodeTreeProps) {
  return (
    <NavigationMenu.Root className="relative">
      <NavigationMenu.List className="m-0 p-0 list-none">
        {nodes
          .filter((n) => !n.parent)
          .map((node) => (
            <TreeNode key={node.id} node={node} onSelect={onNodeSelect} />
          ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
