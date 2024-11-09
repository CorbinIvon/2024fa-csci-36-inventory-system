'use client'
import React from 'react'
import { Autocomplete, TextField, Button, Box } from '@mui/material'
import Node from '@repo/node-api/src/node'

interface SearchBarProps {
  searchTerm: string
  onSearch: (term: string) => void
  onClear: () => void
  nodes: Node[] // Add nodes prop
}

interface NodeOption {
  id: string
  name: string
  path: string // Store the full path to the node
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch, onClear, nodes }) => {
  const [term, setTerm] = React.useState(searchTerm)
  const [options, setOptions] = React.useState<NodeOption[]>([])

  // Helper function to get all nodes including nested ones
  const getAllNodes = (nodes: Node[], parentPath = ''): NodeOption[] => {
    let result: NodeOption[] = []
    nodes.forEach((node) => {
      const currentPath = parentPath ? `${parentPath} / ${node.value.name}` : node.value.name
      result.push({
        id: node.value.id,
        name: node.value.name,
        path: currentPath,
      })
      result = result.concat(getAllNodes(node.getChildren(), currentPath))
    })
    return result
  }

  // Update options when nodes change
  React.useEffect(() => {
    setOptions(getAllNodes(nodes))
  }, [nodes])

  const handleSearch = (value: string) => {
    setTerm(value)
    onSearch(value)
  }

  const handleClear = () => {
    setTerm('')
    onClear()
  }

  return (
    <Box display="flex" alignItems="center" sx={{ minWidth: 300 }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.path)}
        inputValue={term}
        onInputChange={(_, value) => handleSearch(value)}
        renderInput={(params) => (
          <TextField {...params} placeholder="Search nodes..." variant="outlined" size="small" />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box>
              <div>{option.name}</div>
              <div style={{ fontSize: '0.8em', color: 'gray' }}>{option.path}</div>
            </Box>
          </li>
        )}
        sx={{ flexGrow: 1, marginRight: 1 }}
      />
      <Button onClick={handleClear} color="secondary" variant="outlined">
        Clear
      </Button>
    </Box>
  )
}

export default SearchBar
