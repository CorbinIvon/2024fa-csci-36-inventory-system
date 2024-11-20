'use client'
import React from 'react'
import { Autocomplete, TextField, Button, Box } from '@mui/material'
import NodeData from '@repo/node-api/src/nodeData'

interface SearchBarProps {
  searchTerm: string
  onSearch: (term: string) => void
  onClear: () => void
  nodes: NodeData[]
  onNodeSelect?: (node: NodeData) => void
}

// Get all nodes as a flat array
const getAllNodes = (nodes: NodeData[]): NodeData[] => {
  let result: NodeData[] = []
  nodes.forEach((node) => {
    result.push(node)
    result = result.concat(getAllNodes(node.getChildren()))
  })
  return result
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch, onClear, nodes, onNodeSelect }) => {
  const [term, setTerm] = React.useState(searchTerm)
  const [options, setOptions] = React.useState<NodeData[]>([])

  React.useEffect(() => {
    setOptions(getAllNodes(nodes))
  }, [nodes])

  const handleClear = () => {
    setTerm('')
    onClear()
  }

  return (
    <Box display="flex" alignItems="center" sx={{ minWidth: 300 }}>
      <Autocomplete
        freeSolo
        options={options}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option
          return option.getPath()
        }}
        inputValue={term}
        onInputChange={(_, value) => {
          setTerm(value)
          onSearch(value)
        }}
        onChange={(_, value) => {
          if (value instanceof NodeData && onNodeSelect) {
            onNodeSelect(value)
            setTerm('')
          }
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box>
              <div>{option.name}</div>
              <div style={{ fontSize: '0.8em', color: 'gray' }}>{option.getPath()}</div>
            </Box>
          </li>
        )}
        sx={{ flexGrow: 1, marginRight: 1 }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Search nodes..." variant="outlined" size="small" />
        )}
      />
      <Button onClick={handleClear} color="secondary" variant="outlined">
        Clear
      </Button>
    </Box>
  )
}

export default SearchBar
