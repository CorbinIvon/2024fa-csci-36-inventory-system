'use client'

import React from 'react'
import { Button } from '@material-ui/core'

interface GenericButtonProps {
  label: string
  onClick: () => void
  color?: 'default' | 'inherit' | 'primary' | 'secondary'
  variant?: 'text' | 'outlined' | 'contained'
}

const GenericButton: React.FC<GenericButtonProps> = ({ label, onClick, color = 'default', variant = 'text' }) => {
  return (
    <Button onClick={onClick} color={color} variant={variant}>
      {label}
    </Button>
  )
}

export default GenericButton
