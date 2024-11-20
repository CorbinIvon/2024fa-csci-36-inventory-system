'use client'
import React from 'react'
import { Autocomplete, TextField, Button, Box } from '@mui/material'
import NodeData from '@repo/node-api/src/nodeData'

interface SearchBarProps {
  searchTerm: string
  onSearch: (term: string) => void
  onClear: () => void
  nodes: NodeData[]
  onNodeSelect?: (node: NodeData) => void // Add this prop
}

interface NodeOption {
  id: string
  name: string
  path: string // Store the full path to the node
  node: NodeData // Add reference to actual node
}

// Move getAllNodes outside of component
const getAllNodes = (nodes: NodeData[], parentPath = ''): NodeOption[] => {
  let result: NodeOption[] = []
  nodes.forEach((node) => {
    const nodeName = node.name || 'Unnamed Node'
    const currentPath = parentPath ? `${parentPath} / ${nodeName}` : nodeName
    result.push({
      id: node.id, // Using the unique node ID
      name: nodeName,
      path: currentPath,
      node: node,
    })
    result = result.concat(getAllNodes(node.getChildren(), currentPath))
  })
  return result
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch, onClear, nodes, onNodeSelect }) => {
  const [term, setTerm] = React.useState(searchTerm)
  const [currentPath, setCurrentPath] = React.useState('')
  const [options, setOptions] = React.useState<NodeOption[]>([])

  // Update options when nodes change
  React.useEffect(() => {
    // Always show all available options from current context
    setOptions(getAllNodes(nodes))
  }, [nodes]) // Only depend on nodes prop

  const handleInputChange = (value: string) => {
    // If user is typing after last '/', update search term only
    // Otherwise, update the path
    const parts = value.split(' / ')
    if (parts.length > 1) {
      const newPath = parts.slice(0, -1).join(' / ')
      setCurrentPath(newPath)
      setTerm(parts[parts.length - 1] || '')
    } else {
      setCurrentPath('')
      setTerm(value)
    }
    onSearch(value)
  }

  const handleClear = () => {
    setCurrentPath('')
    setTerm('')
    onClear()
  }

  return (
    <Box display="flex" alignItems="center" sx={{ minWidth: 300 }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.path)}
        inputValue={currentPath ? `${currentPath} / ${term}` : term}
        onInputChange={(_, value) => handleInputChange(value)}
        onChange={(_, value) => {
          if (typeof value === 'object' && value && onNodeSelect) {
            onNodeSelect(value.node)
          }
        }}
        onFocus={() => setOptions(getAllNodes(nodes))}
        renderInput={(params) => (
          <TextField {...params} placeholder="Search nodes..." variant="outlined" size="small" />
        )}
        renderOption={(props, option) => {
          // Ensure unique key by combining id with path
          const uniqueKey = `${option.id}-${option.path.replace(/\s/g, '-')}`
          return (
            <li {...props} key={uniqueKey}>
              <Box>
                <div>{option.name}</div>
                <div style={{ fontSize: '0.8em', color: 'gray' }}>{option.path}</div>
              </Box>
            </li>
          )
        }}
        sx={{ flexGrow: 1, marginRight: 1 }}
      />
      <Button onClick={handleClear} color="secondary" variant="outlined">
        Clear
      </Button>
    </Box>
  )
}

export default SearchBar
