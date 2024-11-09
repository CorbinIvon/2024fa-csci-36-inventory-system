'use client'

import React from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

interface FilterOptionsProps {
  options: string[]
  selectedOption: string
  onSelect: (option: string) => void
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ options, selectedOption, onSelect }) => {
  return (
    <FormControl>
      <InputLabel>Filter</InputLabel>
      <Select value={selectedOption} onChange={(e) => onSelect(e.target.value as string)}>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default FilterOptions
