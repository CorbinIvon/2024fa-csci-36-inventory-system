import { ButtonHTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonRoundProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon: LucideIcon
}

export function ButtonRound({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}: ButtonRoundProps) {
  const baseStyles = 'rounded-full flex items-center justify-center transition-colors'
  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }
  const variantStyles = {
    primary: 'bg-[var(--primary-color)] text-[var(--text-color)] hover:bg-[var(--secondary-color)]',
    secondary: 'bg-[var(--secondary-color)] text-[var(--text-color)] hover:opacity-80',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent hover:bg-[var(--secondary-color)] text-[var(--text-color)]',
  }

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
    </button>
  )
}
