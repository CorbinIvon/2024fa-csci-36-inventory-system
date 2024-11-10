'use client'

import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, styled } from '@mui/material'

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    minWidth: '300px',
    padding: '16px',
  },
})

interface DialogButtonProps {
  label: string
  onClick: () => void
  color?: 'primary' | 'secondary' | 'error'
  variant?: 'contained' | 'outlined' | 'text'
}

interface ConfirmationDialogProps {
  open: boolean
  title: string
  onClose: () => void
  children?: React.ReactNode
  buttons?: DialogButtonProps[]
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, title, onClose, children, buttons = [] }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      disableScrollLock
      slotProps={{
        backdrop: {
          style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className={`mui-button mui-button-${button.color || 'primary'} mui-button-${button.variant || 'contained'}`}
          >
            {button.label}
          </button>
        ))}
      </DialogActions>
    </StyledDialog>
  )
}

export default ConfirmationDialog
