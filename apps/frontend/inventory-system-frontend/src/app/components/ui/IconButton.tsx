'use client'
import React from 'react'
import { IconButton as MuiIconButton } from '@mui/material'
import { SvgIconComponent } from '@mui/icons-material'

export enum IconButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum IconButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DEFAULT = 'default',
  INHERIT = 'inherit',
}

interface IconButtonProps {
  icon: SvgIconComponent
  onClick?: () => void
  size?: IconButtonSize
  type?: IconButtonType
  disabled?: boolean
  className?: string
}

const sizeMap: Record<IconButtonSize, string> = {
  [IconButtonSize.SMALL]: '32px',
  [IconButtonSize.MEDIUM]: '40px',
  [IconButtonSize.LARGE]: '48px',
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  size = IconButtonSize.MEDIUM,
  type = IconButtonType.PRIMARY,
  disabled = false,
  className = '',
}) => {
  return (
    <MuiIconButton
      onClick={onClick}
      disabled={disabled}
      color={type}
      className={`rounded-full ${className}`}
      sx={{
        width: sizeMap[size],
        height: sizeMap[size],
        backgroundColor: 'var(--primary-color)',
        color: 'var(--background-color)',
        '&:hover': {
          backgroundColor: 'var(--secondary-color)',
        },
        '&.Mui-disabled': {
          backgroundColor: '#b3b3b3',
          color: '#ffffff',
        },
      }}
    >
      <Icon fontSize={size} />
    </MuiIconButton>
  )
}

export default IconButton
