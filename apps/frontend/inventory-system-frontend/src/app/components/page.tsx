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
    <div className="pl-5 pt-5">
      <ThemePicker />
      <h1>Component Demonstrations</h1>

      <h2>&gt;&gt;&gt; components/auth/</h2>
      <h4>SignInWithGoogle.tsx</h4>

      <h2>&gt;&gt;&gt; components/ui/</h2>
      <h4>CircleButton.tsx</h4>
      <h4>HomeButton.tsx</h4>
      <h4>LoadingSpinner.tsx</h4>
      <h4>ErrorBoundary.tsx</h4>
      <h4>GenericButton.tsx</h4>

      <h2>&gt;&gt;&gt; components/user/</h2>
      <h4>UserProfile.tsx</h4>

      <h2>&gt;&gt;&gt; components/navigation/</h2>
      <h4>BreadcrumbNavigation.tsx</h4>
      <h4>SideNavigationMenu.tsx</h4>

      <h2>&gt;&gt;&gt; components/node/</h2>
      <h4>NodeList.tsx</h4>
      <h4>NodeCard.tsx</h4>
      <h4>NodeCreationForm.tsx</h4>
      <h4>NodeDescriptionModal.tsx</h4>

      <h2>&gt;&gt;&gt; components/search/</h2>
      <h4>SearchBar.tsx</h4>
      <SearchBar searchTerm={searchTerm} onSearch={handleSearch} onClear={handleClear} />
      <h4>FilterOptions.tsx</h4>
      <FilterOptions
        options={['Option 1', 'Option 2', 'Option 3']}
        selectedOption={selectedOption}
        onSelect={handleSelect}
      />

      <h2>&gt;&gt;&gt; components/utility/</h2>
      <h4>ConfirmationDialog.tsx</h4>
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
