// 簡單的 Toast 通知組件
'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type: Toast['type'], duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    // 自動移除
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg max-w-sm
              ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
              ${toast.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : ''}
              ${toast.type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
              animate-fade-in-up
            `}
            onClick={() => removeToast(toast.id)}
          >
            <div className="font-medium">
              {toast.type === 'success' && '✅ '}
              {toast.type === 'error' && '❌ '}
              {toast.type === 'warning' && '⚠️ '}
              {toast.type === 'info' && 'ℹ️ '}
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// 全局函數（可以在任何地方調用）
let globalShowToast: ToastContextType['showToast'] | null = null

export function setGlobalToast(showToast: ToastContextType['showToast']) {
  globalShowToast = showToast
}

export function showGlobalToast(message: string, type: Toast['type'] = 'info', duration?: number) {
  if (globalShowToast) {
    globalShowToast(message, type, duration)
  } else {
    console.log(`[Toast] ${type}: ${message}`)
  }
}
