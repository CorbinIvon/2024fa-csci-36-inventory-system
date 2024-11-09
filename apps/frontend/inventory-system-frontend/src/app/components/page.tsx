'use client'
import React, { useState, useEffect } from 'react'
import SearchBar from './search/SearchBar'
import FilterOptions from './search/FilterOptions'
import ConfirmationDialog from './utility/ConfirmationDialog'
import ThemePicker from './utility/ThemePicker'

const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    console.log('Search term:', term)
  }

  const handleClear = () => {
    setSearchTerm('')
    console.log('Search cleared')
  }

  const handleSelect = (option: string) => {
    setSelectedOption(option)
    console.log('Selected option:', option)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  if (!isHydrated) {
    return null
  }

  return (
    <div>
      <h1>Component Demonstrations</h1>

      {/* ThemePicker Component */}
      <h2>Theme Picker</h2>
      <ThemePicker />

      <h2>SearchBar Component</h2>
      <SearchBar searchTerm={searchTerm} onSearch={handleSearch} onClear={handleClear} />

      <h2>FilterOptions Component</h2>
      <FilterOptions
        options={['Option 1', 'Option 2', 'Option 3']}
        selectedOption={selectedOption}
        onSelect={handleSelect}
      />

      <h2>Dialog Component</h2>
      <button onClick={() => setIsDialogOpen(true)}>Click Me!</button>

      <ConfirmationDialog
        open={isDialogOpen}
        title="You Clicked a button!"
        onClose={handleCloseDialog}
        buttons={[
          { label: 'Ok', onClick: handleCloseDialog },
          { label: 'Awesome!', onClick: handleCloseDialog },
        ]}
      >
        Congrats! You clicked a button! You really did it! What did you expect to happen?
      </ConfirmationDialog>
    </div>
  )
}

export default Page
