'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import { useUITheme, getColorClass } from './UIThemeProvider'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { theme } = useUITheme()
  
  // 基礎樣式類
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  // 變體樣式
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  }
  
  // 尺寸樣式
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-5 py-2.5 text-base rounded-md',
    xl: 'px-6 py-3 text-base rounded-md',
  }
  
  // 圓角樣式
  const roundedClass = rounded ? 'rounded-full' : ''
  
  // 寬度樣式
  const widthClass = fullWidth ? 'w-full' : ''
  
  // 加載狀態樣式
  const loadingClass = loading ? 'cursor-wait' : ''
  
  // 禁用狀態
  const isDisabled = disabled || loading
  
  // 組合所有樣式
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClass,
    widthClass,
    loadingClass,
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {/* 加載指示器 */}
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      
      {/* 左側圖標 */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {/* 按鈕文字 */}
      {children}
      
      {/* 右側圖標 */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

// 預定義的按鈕組件
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />
}

export function WarningButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="warning" {...props} />
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />
}

export function InfoButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="info" {...props} />
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />
}

// 圖標按鈕
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode
  label: string
}

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      className="p-2"
      rounded
      {...props}
    >
      {icon}
    </Button>
  )
}

// 按鈕組
interface ButtonGroupProps {
  children: ReactNode
  className?: string
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      {children}
    </div>
  )
}