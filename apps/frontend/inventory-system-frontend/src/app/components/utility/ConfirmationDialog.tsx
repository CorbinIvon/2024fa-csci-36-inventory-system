import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  content: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, title, content, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
