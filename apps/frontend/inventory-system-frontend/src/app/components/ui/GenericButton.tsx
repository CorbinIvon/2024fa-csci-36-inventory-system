'use client'

import React from 'react'
import { Button } from '@mui/material'

interface GenericButtonProps {
  label: string
  onClick: () => void
  color?: 'default' | 'inherit' | 'primary' | 'secondary'
  variant?: 'text' | 'outlined' | 'contained'
}

const GenericButton: React.FC<GenericButtonProps> = ({ label, onClick, variant = 'text' }) => {
  return (
    <Button onClick={onClick} variant={variant}>
      {label}
    </Button>
  )
}

export default GenericButton
