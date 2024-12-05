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
    onSearch(flattenedResults)
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
        />
      </div>

      {searchResults.length > 0 && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                onNodeSelect(node.id!.toString())
                setSearchTerm('')
                setSearchResults([])
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2
                ${node.deleted ? 'italic text-gray-500' : ''}
              `}
            >
              <span className="flex-grow">{node.title}</span>
              {node.deleted && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Deleted</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
