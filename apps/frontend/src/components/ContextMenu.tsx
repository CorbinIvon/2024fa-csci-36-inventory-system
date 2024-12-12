import { useEffect, useRef, useState } from 'react'
import { NodePoint } from '@repo/node-api/src/nodePoint'
import { Search } from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onNewNode: () => void
  onDelete: () => void
  onRestore?: () => void
  isDeleted?: boolean
  nodes?: NodePoint[]
  onMove?: (targetNodeId: number) => void
  currentNodeId?: number // Add this new prop
}

export function ContextMenu({
  x,
  y,
  onClose,
  onNewNode,
  onDelete,
  onRestore,
  isDeleted,
  nodes = [],
  onMove,
  currentNodeId,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showMoveSearch, setShowMoveSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<NodePoint[]>([])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    if (showMoveSearch) {
      // Focus the search input when move search is shown
      searchInputRef.current?.focus()
    }
  }, [showMoveSearch])

  // Improved descendant check that traverses up through parents
  const findNode = (nodeId: number, nodeList: NodePoint[]): NodePoint | null => {
    for (const node of nodeList) {
      if (node.id === nodeId) return node
      const found = findNode(nodeId, node.children)
      if (found) return found
    }
    return null
  }

  const isDescendantOrSelf = (nodeToCheck: NodePoint): boolean => {
    const currentNode = findNode(currentNodeId!, nodes)
    if (!currentNode) return false

    const checkIfDescendant = (node: NodePoint): boolean => {
      return node.children.some((child) => child.id === nodeToCheck.id || checkIfDescendant(child))
    }

    return nodeToCheck.id === currentNodeId || checkIfDescendant(currentNode)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    // Get all nodes in a flat structure
    const flattenNodes = (nodeList: NodePoint[]) => {
      const result: NodePoint[] = []
      const traverse = (node: NodePoint) => {
        if (!isDescendantOrSelf(node)) {
          result.push(node)
        }
        node.children.forEach(traverse)
      }
      nodeList.forEach(traverse)
      return result
    }

    // Get flattened list of all nodes and filter by search term
    const results = flattenNodes(nodes).filter(
      (node) => node.title.toLowerCase().includes(term.toLowerCase()) && !node.deleted,
    )

    setSearchResults(results)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      const firstResult = searchResults[0]
      if (firstResult && firstResult.id !== undefined) {
        onMove?.(firstResult.id)
        onClose()
      }
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-lg py-1 w-48 border z-50"
      style={{ left: x, top: y }}
    >
      {isDeleted ? (
        onRestore && (
          <button onClick={onRestore} className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-600 text-sm">
            Restore Node
          </button>
        )
      ) : (
        <>
          <button onClick={onNewNode} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">
            Add New Node
          </button>
          {onMove && (
            <button
              onClick={() => setShowMoveSearch(true)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
            >
              Move to...
            </button>
          )}
          <hr className="my-1 border-gray-200" />
          <button onClick={onDelete} className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm">
            Delete Node
          </button>
        </>
      )}

      {showMoveSearch && (
        <div className="absolute left-full ml-2 top-0 w-64 bg-white shadow-lg rounded-lg border p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for destination..."
              className="w-full pl-8 pr-4 py-2 border rounded text-sm"
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    onMove?.(node.id!)
                    onClose()
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  {node.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
