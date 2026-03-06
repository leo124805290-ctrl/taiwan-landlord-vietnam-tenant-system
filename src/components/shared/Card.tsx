'use client'

import React, { ReactNode } from 'react'
import { useUITheme } from './UIThemeProvider'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  headerAction?: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  hoverable?: boolean
}

export function Card({
  children,
  title,
  subtitle,
  footer,
  headerAction,
  className = '',
  padding = 'md',
  shadow = 'md',
  bordered = true,
  hoverable = false,
}: CardProps) {
  const { theme } = useUITheme()
  
  // 內邊距類
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  
  // 陰影類
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }
  
  // 邊框類
  const borderClass = bordered ? 'border border-gray-200' : ''
  
  // 懸停效果類
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow duration-200' : ''
  
  // 圓角類
  const roundedClass = 'rounded-lg'
  
  // 背景類
  const bgClass = 'bg-white'
  
  // 組合所有樣式
  const cardClasses = [
    bgClass,
    roundedClass,
    borderClass,
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverClass,
    className,
  ].filter(Boolean).join(' ')
  
  return (
    <div className={cardClasses}>
      {/* 卡片頭部 */}
      {(title || subtitle || headerAction) && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div>{headerAction}</div>
            )}
          </div>
        </div>
      )}
      
      {/* 卡片內容 */}
      <div className="text-gray-700">
        {children}
      </div>
      
      {/* 卡片底部 */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  )
}

// 統計卡片
interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  color = 'primary',
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-purple-50 text-purple-700 border-purple-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  }
  
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }
  
  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  }
  
  return (
    <Card
      className={`${colorClasses[color]} border`}
      padding="md"
      shadow="sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {change && (
            <div className="mt-1 flex items-center text-sm">
              <span className={`font-medium ${trendColors[trend]}`}>
                {trendIcons[trend]} {change}
              </span>
              <span className="ml-1 text-gray-500">vs 上月</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-70">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// 卡片網格容器
interface CardGridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CardGrid({
  children,
  cols = 3,
  gap = 'md',
  className = '',
}: CardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }
  
  const gridGap = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }
  
  return (
    <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  )
}