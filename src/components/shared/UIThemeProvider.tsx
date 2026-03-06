'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// 統一主題配置
export interface UITheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    surface: string
    text: {
      primary: string
      secondary: string
      disabled: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// 默認主題配置
const defaultTheme: UITheme = {
  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#8b5cf6', // purple-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    info: '#06b6d4', // cyan-500
    background: '#f9fafb', // gray-50
    surface: '#ffffff',
    text: {
      primary: '#111827', // gray-900
      secondary: '#6b7280', // gray-500
      disabled: '#9ca3af', // gray-400
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  borderRadius: {
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
}

// 創建主題上下文
const ThemeContext = createContext<{
  theme: UITheme
  setTheme: (theme: UITheme) => void
  isDarkMode: boolean
  toggleDarkMode: () => void
}>({
  theme: defaultTheme,
  setTheme: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
})

// 主題提供者組件
interface UIThemeProviderProps {
  children: ReactNode
  initialTheme?: UITheme
}

export function UIThemeProvider({ children, initialTheme = defaultTheme }: UIThemeProviderProps) {
  const [theme, setTheme] = useState<UITheme>(initialTheme)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // 切換暗色主題
    if (!isDarkMode) {
      setTheme({
        ...theme,
        colors: {
          ...theme.colors,
          background: '#111827', // gray-900
          surface: '#1f2937',   // gray-800
          text: {
            primary: '#f9fafb', // gray-50
            secondary: '#d1d5db', // gray-300
            disabled: '#6b7280', // gray-500
          },
        },
      })
    } else {
      setTheme(defaultTheme)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 使用主題的Hook
export function useUITheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useUITheme must be used within a UIThemeProvider')
  }
  return context
}

// 主題工具函數
export function getColorClass(color: keyof UITheme['colors'], variant: 'bg' | 'text' | 'border' = 'bg') {
  const colorMap: Record<keyof UITheme['colors'], string> = {
    primary: 'blue',
    secondary: 'purple',
    success: 'emerald',
    warning: 'amber',
    danger: 'red',
    info: 'cyan',
    background: 'gray',
    surface: 'white',
    text: 'gray',
  }
  
  const baseColor = colorMap[color] || 'gray'
  const shade = color === 'background' ? '50' : color === 'surface' ? 'white' : '500'
  
  return `${variant}-${baseColor}-${shade}`
}

// CSS變量注入組件
export function ThemeVariables() {
  const { theme } = useUITheme()
  
  return (
    <style jsx global>{`
      :root {
        /* 顏色變量 */
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-danger: ${theme.colors.danger};
        --color-info: ${theme.colors.info};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text-primary: ${theme.colors.text.primary};
        --color-text-secondary: ${theme.colors.text.secondary};
        --color-text-disabled: ${theme.colors.text.disabled};
        
        /* 間距變量 */
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
        
        /* 圓角變量 */
        --radius-sm: ${theme.borderRadius.sm};
        --radius-md: ${theme.borderRadius.md};
        --radius-lg: ${theme.borderRadius.lg};
        --radius-xl: ${theme.borderRadius.xl};
        --radius-full: ${theme.borderRadius.full};
        
        /* 字體變量 */
        --font-family: ${theme.typography.fontFamily};
        --font-size-xs: ${theme.typography.fontSize.xs};
        --font-size-sm: ${theme.typography.fontSize.sm};
        --font-size-md: ${theme.typography.fontSize.md};
        --font-size-lg: ${theme.typography.fontSize.lg};
        --font-size-xl: ${theme.typography.fontSize.xl};
        --font-size-2xl: ${theme.typography.fontSize['2xl']};
        
        /* 陰影變量 */
        --shadow-sm: ${theme.shadows.sm};
        --shadow-md: ${theme.shadows.md};
        --shadow-lg: ${theme.shadows.lg};
        --shadow-xl: ${theme.shadows.xl};
      }
      
      body {
        background-color: var(--color-background);
        color: var(--color-text-primary);
        font-family: var(--font-family);
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      /* 統一按鈕樣式 */
      .btn-primary {
        background-color: var(--color-primary);
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        font-weight: ${theme.typography.fontWeight.medium};
        transition: background-color 0.2s ease;
      }
      
      .btn-primary:hover {
        background-color: ${darkenColor(theme.colors.primary, 10)};
      }
      
      /* 統一卡片樣式 */
      .card {
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-md);
        transition: box-shadow 0.2s ease;
      }
      
      .card:hover {
        box-shadow: var(--shadow-lg);
      }
      
      /* 統一表格樣式 */
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .table th {
        background-color: var(--color-background);
        padding: var(--spacing-sm) var(--spacing-md);
        text-align: left;
        font-weight: ${theme.typography.fontWeight.semibold};
        border-bottom: 2px solid var(--color-text-disabled);
      }
      
      .table td {
        padding: var(--spacing-sm) var(--spacing-md);
        border-bottom: 1px solid var(--color-text-disabled);
      }
      
      /* 響應式設計 */
      @media (max-width: 768px) {
        .card {
          padding: var(--spacing-sm);
        }
        
        .table th,
        .table td {
          padding: var(--spacing-xs) var(--spacing-sm);
        }
      }
    `}</style>
  )
}

// 輔助函數：顏色變暗
function darkenColor(color: string, percent: number): string {
  // 簡化的顏色變暗邏輯
  return color
}