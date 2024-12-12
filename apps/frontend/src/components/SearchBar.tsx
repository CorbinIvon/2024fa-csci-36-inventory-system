import { Search } from 'lucide-react'
import { NodePoint } from '@repo/node-api/src/nodePoint'
import { ChangeEvent, useState } from 'react'

interface SearchBarProps {
  onSearch: (filteredNodes: NodePoint[]) => void
  nodes: NodePoint[]
  onNodeSelect: (nodeId: string) => void
}

export function SearchBar({ onSearch, nodes, onNodeSelect }: SearchBarProps) {
  const [searchResults, setSearchResults] = useState<NodePoint[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const searchNodes = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (!term.trim()) {
      setSearchResults([])
      onSearch(nodes)
      return
    }

    const flattenedResults: NodePoint[] = []

    const searchInNode = (node: NodePoint) => {
      // Check if current node matches
      if (
        node.title.toLowerCase().includes(term) ||
        node.description?.toLowerCase().includes(term) ||
        (node.data && JSON.stringify(node.data).toLowerCase().includes(term))
      ) {
        flattenedResults.push(node)
      }

      // Search in children
      node.children.forEach((child) => searchInNode(child))
    }

    // Search through all nodes
    nodes.forEach((node) => searchInNode(node))

    setSearchResults(flattenedResults)
    // Keep the tree structure in the main view
    onSearch(nodes)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      const firstResult = searchResults[0]
      // Add check to ensure firstResult exists
      if (firstResult && firstResult.id !== undefined) {
        onNodeSelect(firstResult.id.toString())
        setSearchTerm('')
        setSearchResults([])
      }
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search by title, description, or data..."
          className="pl-10 pr-4 py-2 w-full border rounded"
          onChange={searchNodes}
          onKeyPress={handleKeyPress}
        />
      </div>

      {searchResults.length > 0 && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-[var(--background-color)] border border-[var(--secondary-color)] border-opacity-20 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                onNodeSelect(node.id!.toString())
                setSearchTerm('')
                setSearchResults([])
              }}
              className={`w-full px-4 py-2 text-left text-[var(--text-color)] hover:bg-[var(--secondary-color)] hover:bg-opacity-10 hover:text-[var(--text-color-hover)] transition-colors
                ${node.deleted ? 'italic opacity-50' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {/* Render icon if present in data */}
                {node.data?.icon && (
                  <span className="text-sm opacity-70">
                    {typeof node.data.icon === 'string' && node.data.icon.length <= 3 ? node.data.icon : '📄'}
                  </span>
                )}
                <span className="flex-grow font-medium">{node.title}</span>
                {/* Render count if present in data */}
                {node.data?.count && (
                  <span className="text-xs bg-[var(--secondary-color)] bg-opacity-10 px-2 py-0.5 rounded">
                    {node.data.count}
                  </span>
                )}
                {node.deleted && (
                  <span className="text-xs bg-red-500 bg-opacity-10 text-red-400 px-1.5 py-0.5 rounded shrink-0">
                    Deleted
                  </span>
                )}
              </div>
              {(node.description || Object.keys(node.data || {}).length > 0) && (
                <div className="flex flex-col gap-1 mt-0.5">
                  {node.description && <p className="text-sm opacity-70 truncate">{node.description}</p>}
                  {Object.keys(node.data || {}).length > 0 &&
                    // Filter out 'icon' and 'count' from data display
                    Object.keys(node.data || {}).filter((key) => !['icon', 'count'].includes(key)).length > 0 && (
                      <span className="text-xs bg-[var(--secondary-color)] bg-opacity-10 px-2 py-1 rounded text-[var(--text-color)] truncate">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(node.data || {}).filter(([key]) => !['icon', 'count'].includes(key)),
                          ),
                        )}
                      </span>
                    )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
