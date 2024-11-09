import React, { useState, useEffect } from 'react'

const ThemePicker: React.FC = () => {
  // Available themes
  const themes: string[] = [
    'strawberry',
    'mint',
    'blueberry',
    'lemon',
    'grape',
    'chocolate',
    'coconut',
    'orange',
    'watermelon',
    'peach',
  ]

  // State for selected theme and dark mode toggle
  const [selectedTheme, setSelectedTheme] = useState<string>(themes[0] || 'mint')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Effect to update the theme on the document
  useEffect(() => {
    const theme = isDarkMode ? `dark-${selectedTheme}` : selectedTheme
    document.documentElement.setAttribute('data-theme', theme)
  }, [selectedTheme, isDarkMode])

  // Handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTheme(event.target.value)
  }

  // Handle toggle for dark mode
  const handleToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="theme-picker">
      <label>
        Dark Mode:
        <input type="checkbox" checked={isDarkMode} onChange={handleToggle} />
      </label>

      <select value={selectedTheme} onChange={handleThemeChange}>
        {themes.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ThemePicker
