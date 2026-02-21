'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppState, AppData } from '@/lib/types'
import { initData, calcAllPayments } from '@/lib/utils'

interface AppContextType {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  updateData: (updates: Partial<AppData>) => void
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  getCurrentProperty: () => any
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // 初始化狀態
  const [state, setState] = useState<AppState>({
    tab: 'dashboard',
    lang: 'zh-TW',
    modal: null,
    filter: 'all',
    currentProperty: null,
    revenueTimeScope: 'all',
    revenueYear: 2026,
    revenueMonth: '2026-02',
    elecTimeScope: 'all',
    elecYear: 2026,
    elecMonth: '2026-02',
    data: initData(),
  })

  // 載入本地儲存資料
  useEffect(() => {
    const saved = localStorage.getItem('multiPropertyDataV2')
    if (saved) {
      try {
        const parsedData: AppData = JSON.parse(saved)
        setState(prev => ({
          ...prev,
          data: parsedData,
          currentProperty: parsedData.properties[0]?.id || null
        }))
      } catch (error) {
        console.error('載入資料失敗:', error)
      }
    } else {
      // 初始化資料
      const initialData = initData()
      setState(prev => ({
        ...prev,
        data: initialData,
        currentProperty: initialData.properties[0]?.id || null
      }))
    }
  }, [])

  // 計算付款
  useEffect(() => {
    calcAllPayments(state.data)
  }, [state.data])

  // 儲存資料到本地儲存
  useEffect(() => {
    localStorage.setItem('multiPropertyDataV2', JSON.stringify(state.data))
  }, [state.data])

  // 更新狀態的輔助函數
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // 更新資料的輔助函數
  const updateData = (updates: Partial<AppData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }))
  }

  // 開啟模態框
  const openModal = (type: string, data?: any) => {
    updateState({ modal: { type, data } })
  }

  // 關閉模態框
  const closeModal = () => {
    updateState({ modal: null })
  }

  // 取得當前物業
  const getCurrentProperty = () => {
    return state.data.properties.find(p => p.id === state.currentProperty)
  }

  const value = {
    state,
    updateState,
    updateData,
    openModal,
    closeModal,
    getCurrentProperty,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}