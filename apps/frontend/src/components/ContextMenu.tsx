import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onNewNode: () => void
}

export function ContextMenu({ x, y, onClose, onNewNode }: ContextMenuProps) {
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
      <button onClick={onNewNode} className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm">
        Add New Node
      </button>
    </div>
  )
}
