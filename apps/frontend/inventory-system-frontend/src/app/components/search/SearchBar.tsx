'use client'
import React from 'react'
import { TextField, Button, Box } from '@mui/material'

interface SearchBarProps {
  searchTerm: string
  onSearch: (term: string) => void
  onClear: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearch, onClear }) => {
  const [term, setTerm] = React.useState(searchTerm)

  const handleSearch = () => {
    onSearch(term)
  }

  const handleClear = () => {
    setTerm('')
    onClear()
  }

  return (
    <Box display="flex" alignItems="center">
      <TextField
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search..."
        variant="outlined"
        size="small"
        sx={{ marginRight: 1 }}
      />
      <Button onClick={handleSearch} color="primary" variant="contained" sx={{ marginRight: 1 }}>
        Search
      </Button>
      <Button onClick={handleClear} color="secondary" variant="outlined">
        Clear
      </Button>
    </Box>
  )
}

export default SearchBar
