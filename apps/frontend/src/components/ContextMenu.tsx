import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onNewNode: () => void
  onDelete: () => void
  onRestore?: () => void
  isDeleted?: boolean
}

export function ContextMenu({ x, y, onClose, onNewNode, onDelete, onRestore, isDeleted }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-lg py-1 w-48 border z-50"
      style={{ left: x, top: y }}
    >
      {isDeleted ? (
        onRestore && ( // Only show restore button if handler exists
          <button onClick={onRestore} className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-600 text-sm">
            Restore Node
          </button>
        )
      ) : (
        <>
          <button onClick={onNewNode} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">
            Add New Node
          </button>
          <hr className="my-1 border-gray-200" />
          <button onClick={onDelete} className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm">
            Delete Node
          </button>
        </>
      )}
    </div>
  )
}
