'use client'
import React from 'react'
import { Avatar, IconButton, Tooltip } from '@mui/material'

interface UserProfileProps {
  imageUrl?: string
  name: string
  onClick: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({
  imageUrl, // Remove default value to use MUI's built-in fallback
  name,
  onClick,
}) => {
  return (
    <Tooltip title={`Profile: ${name}`}>
      <IconButton onClick={onClick} className="hover:opacity-80 transition-opacity">
        <Avatar
          src={imageUrl}
          alt={name}
          sx={{
            width: 40,
            height: 40,
            border: '2px solid #e5e7eb',
          }}
        >
          {name.charAt(0)} {/* Shows first letter of name if no image */}
        </Avatar>
      </IconButton>
    </Tooltip>
  )
}

export default UserProfile
